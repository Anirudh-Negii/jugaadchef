"use server";

import { freeMealRecommendations, proTierLimit } from "@/lib/arcjet";
import { checkUser } from "@/lib/checkUser";
import { request } from "@arcjet/next";
import { GoogleGenAI } from "@google/genai";
// import { DUMMY_RECIPE_RESPONSE } from "@/lib/dummy";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

// Helper functions to fetch image from Unsplash
async function fetchRecipeImage(recipeName) {
  try {
    if (!UNSPLASH_ACCESS_KEY) {
      console.warn("Unsplash access key is not set. Skipping image fetch.");
      return "";
    }

    const searchQuery = `${recipeName}`;

    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=1&orientation=landscape`,
      {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
      },
    );

    if (!response.ok) {
      console.error(
        "Failed to fetch image from Unsplash:",
        response.statusText,
      );
      return "";
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const photo = data.results[0];
      console.log("Fetched image from Unsplash:", photo.urls.regular);
      return photo.urls.regular;
    }

    console.warn("No image found for " + recipeName);
    return "";
  } catch (error) {
    console.error("Error fetching image from Unsplash:", error);
    return "";
  }
}

export async function getRecipesByPantryIngredients() {
  try {
    const user = await checkUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const isPro = user.subscriptionTier === "pro";
    const arcjetClient = isPro ? proTierLimit : freeMealRecommendations;
    const req = await request();
    const decision = await arcjetClient.protect(req, {
      userId: user.clerkId,
      requested: 1,
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        throw new Error("Rate limit exceeded");
      }
      throw new Error("Request denied by Arcjet");
    }

    const pantryResponse = await fetch(
      `${STRAPI_URL}/api/pantry-items?filters[owner][id][$eq]=${user.id}`,
      {
        headers: {
          Authorization: `Bearer ${STRAPI_API_TOKEN}`,
        },
        cache: "no-store",
      },
    );

    if (!pantryResponse.ok) {
      throw new Error("Failed to fetch pantry items");
    }

    const pantryData = await pantryResponse.json();
    if (!pantryData.data || pantryData.data.length === 0) {
      return {
        success: false,
        message: "No pantry items found",
      };
    }

    const ingredients = pantryData.data.map((item) => item.name).join(", ");

    const prompt = `
      You are a professional chef. Given these available ingredients: ${ingredients}
      Suggest 5 recipes that can be made primarily with these ingredients. It's okay if the recipes need 1-2 common pantry staples (salt, pepper, oil, etc.) that aren't listed.

      Return ONLY a valid JSON array (no markdown, no explanations):
      [
        {
          "title": "Recipe name",
          "description": "Brief 1-2 sentence description",
          "matchPercentage": 85,
          "missingIngredients": ["ingredient1", "ingredient2"],
          "category": "breakfast|lunch|dinner|snack|dessert",
          "cuisine": "italian|chinese|mexican|etc",
          "prepTime": 20,
          "cookTime": 30,
          "servings": 4
        }
      ]

      Rules:
        - matchPercentage should be 70-100% (how many listed ingredients are used)
        - missingIngredients should be common items or optional additions
        - Sort by matchPercentage descending
        - Make recipes realistic and delicious
    `;

    // Generate recipes using Google Gemini API
    const result = await genAI.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    const text = result.text;

    let recipeSuggestions;
    try {
      const cleanText = text
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      recipeSuggestions = JSON.parse(cleanText);
    } catch (parseError) {
      console.error("Failed to parse recipe suggestions:", text);
      throw new Error("Failed to generate recipe suggestions.");
    }

    return {
      success: true,
      recipes: recipeSuggestions,
      ingredientsUsed: ingredients,
      recommendationLimit: isPro ? "unlimited" : 5,
      message: `Found ${recipeSuggestions.length} recipes you can make!`,
    };
  } catch (error) {
    console.error("Error in generating recipe suggestions:", error);
    throw new Error(error.message || "Failed to get recipes suggestions. ");
  }
}

function normalizeTitle(title) {
  return title
    .trim()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

// Generate recipe from Gemini or fetch from Strapi if it already exists
export async function getOrGenerateRecipe(formData) {
  try {
    const user = await checkUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const recipeName = formData.get("recipeName");
    if (!recipeName) {
      throw new Error("Recipe name is required");
    }

    // Normalize the recipe title
    const normalizedTitle = normalizeTitle(recipeName);
    const isPro = user.subscriptionTier === "pro";

    // Step 1 - Check if the recipe already exists in Strapi
    const searchResponse = await fetch(
      `${STRAPI_URL}/api/recipes?filters[title][$eq]=${encodeURIComponent(normalizedTitle)}&populate=*`,
      {
        headers: {
          Authorization: `Bearer ${STRAPI_API_TOKEN}`,
        },
        cache: "no-store",
      },
    );

    if (searchResponse.ok) {
      const searchData = await searchResponse.json();

      if (searchData.data && searchData.data.length > 0) {
        const savedRecipeResponse = await fetch(
          `${STRAPI_URL}/api/saved-recipes?filters[user][id][$eq]=${user.id}&filters[recipe][id][$eq]=${searchData.data[0].id}`,
          {
            headers: {
              Authorization: `Bearer ${STRAPI_API_TOKEN}`,
            },
            cache: "no-store",
          },
        );

        let isSaved = false;
        if (savedRecipeResponse.ok) {
          const savedData = await savedRecipeResponse.json();
          isSaved = savedData.data && savedData.data.length > 0;
        }

        return {
          success: true,
          recipe: searchData.data[0],
          recipeId: searchData.data[0].id,
          isSaved: isSaved,
          fromDatabase: true,
          isPro,
          message: "Recipe fetched from Database successfully.",
        };
      }
    }

    // Step 2 - If recipe does not exist, generate it using Gemini API
    const prompt = `
      You are a professional chef and recipe expert. Generate a detailed recipe for: "${normalizedTitle}"
      CRITICAL: The "title" field MUST be EXACTLY: "${normalizedTitle}" (no changes, no additions like "Classic" or "Easy")
      Return ONLY a valid JSON object with this exact structure (no markdown, no explanations):
      {
        "title": "${normalizedTitle}",
        "description": "Brief 2-3 sentence description of the dish",
        "category": "Must be ONE of these EXACT values: breakfast, lunch, dinner, snack, dessert",
        "cuisine": "Must be ONE of these EXACT values: italian, chinese, mexican, indian, american, thai, japanese, mediterranean, french, korean, vietnamese, spanish, greek, turkish, moroccan, brazilian, caribbean, middle-eastern, british, german, portuguese, other",
        "prepTime": "Time in minutes (number only)",
        "cookTime": "Time in minutes (number only)",
        "servings": "Number of servings (number only)",
        "ingredients": [
          {
            "item": "ingredient name",
            "amount": "quantity with unit",
            "category": "Protein|Vegetable|Spice|Dairy|Grain|Other"
          }
        ],
        "instructions": [
          {
            "step": 1,
            "title": "Brief step title",
            "instruction": "Detailed step instruction",
            "tip": "Optional cooking tip for this step"
          }
        ],
        "nutrition": {
          "calories": "calories per serving",
          "protein": "grams",
          "carbs": "grams",
          "fat": "grams"
        },
        "tips": [
          "General cooking tip 1",
          "General cooking tip 2",
          "General cooking tip 3"
        ],
        "substitutions": [
          {
            "original": "ingredient name",
            "alternatives": ["substitute 1", "substitute 2"]
          }
        ]
      }

      IMPORTANT RULES FOR CATEGORY:
      - Breakfast items (pancakes, eggs, cereal, etc.) → "breakfast"
      - Main meals for midday (sandwiches, salads, pasta, etc.) → "lunch"
      - Main meals for evening (heavier dishes, roasts, etc.) → "dinner"
      - Light items between meals (chips, crackers, fruit, etc.) → "snack"
      - Sweet treats (cakes, cookies, ice cream, etc.) → "dessert"

      IMPORTANT RULES FOR CUISINE:
      - Use lowercase only
      - Pick the closest match from the allowed values
      - If uncertain, use "other"

      Guidelines:
      - Make ingredients realistic and commonly available
      - Instructions should be clear and beginner-friendly
      - Include 6-10 detailed steps
      - Provide practical cooking tips
      - Estimate realistic cooking times
      - Keep total instructions under 12 steps
    `;

    const result = await genAI.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });
    const text = result.text;

    let recipeData;
    try {
      const cleanText = text
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      recipeData = JSON.parse(cleanText);
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", text);
      throw new Error("Failed to generate recipe data.");
    }

    recipeData.title = normalizedTitle; // Ensure the title is exactly as normalized
    const category = recipeData.category.toLowerCase();
    const cuisine = recipeData.cuisine.toLowerCase();

    // Step 3 - Fetch an image for the recipe from Unsplash
    const imageUrl = await fetchRecipeImage(normalizedTitle);

    // Step 4 - Save the new recipe to Strapi Database
    const strapiRecipeData = {
      data: {
        title: normalizedTitle,
        description: recipeData.description,
        cuisine,
        category,
        ingredients: recipeData.ingredients,
        instructions: recipeData.instructions,
        prepTime: Number(recipeData.prepTime),
        cookTime: Number(recipeData.cookTime),
        servings: Number(recipeData.servings),
        nutrition: recipeData.nutrition,
        tips: recipeData.tips,
        substitutions: recipeData.substitutions,
        imageUrl: imageUrl || "",
        isPublic: true,
        author: user.id,
      },
    };

    const createRecipeResponse = await fetch(`${STRAPI_URL}/api/recipes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${STRAPI_API_TOKEN}`,
      },
      body: JSON.stringify(strapiRecipeData),
    });

    if (!createRecipeResponse.ok) {
      const errorText = await createRecipeResponse.text();
      console.error("Failed to save recipe to Strapi:", errorText);
      throw new Error("Failed to save recipe to database");
    }

    const createdRecipe = await createRecipeResponse.json();

    return {
      success: true,
      recipe: {
        ...recipeData,
        title: normalizedTitle,
        category,
        cuisine,
        imageUrl: imageUrl || "",
      },
      recipeId: createdRecipe.data.id,
      isSaved: false,
      fromDatabase: false,
      isPro,
      recommendationLimit: isPro ? "unlimited" : 5,
      message: "Recipe generated and saved successfully.",
    };
    
    // return DUMMY_RECIPE_RESPONSE;
  } catch (error) {
    console.error("Error in getOrGenerateRecipe:", error);
    throw new Error("Failed to get or generate recipe.");
  }
}

// Save recipe to user's collection (bookmark)
export async function saveRecipeToCollection(formData) {
  try {
    const user = await checkUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const recipeId = formData.get("recipeId");
    if (!recipeId) {
      throw new Error("Recipe ID is required");
    }

    // Check if the recipe is already saved in the user's collection
    const existingResponse = await fetch(
      `${STRAPI_URL}/api/saved-recipes?filters[user][id][$eq]=${user.id}&filters[recipe][id][$eq]=${recipeId}`,
      {
        headers: {
          Authorization: `Bearer ${STRAPI_API_TOKEN}`,
        },
        cache: "no-store",
      },
    );

    if (existingResponse.ok) {
      const existingData = await existingResponse.json();
      if (existingData.data && existingData.data.length > 0) {
        return {
          success: true,
          alreadySaved: true,
          message: "Recipe is already saved in your collection.",
        };
      }
    }

    // If not already saved, save the recipe to the user's collection
    const saveResponse = await fetch(`${STRAPI_URL}/api/saved-recipes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${STRAPI_API_TOKEN}`,
      },
      body: JSON.stringify({
        data: {
          user: user.id,
          recipe: recipeId,
          savedAt: new Date().toISOString(),
        },
      }),
    });

    if (!saveResponse.ok) {
      const errorText = await saveResponse.text();
      console.error("Failed to save recipe:", errorText);
      throw new Error("Failed to save recipe to collection");
    }

    const savedRecipe = await saveResponse.json();

    return {
      success: true,
      alreadySaved: false,
      savedRecipe: savedRecipe.data,
      message: "Recipe saved to your collection successfully.",
    };
  } catch (error) {
    console.error("Error in saveRecipeToCollection:", error);
    throw new Error("Failed to save recipe to collection.");
  }
}

// Remove recipe from user's collection (unbookmark)
export async function removeRecipeFromCollection(formData) {
  try {
    const user = await checkUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const recipeId = formData.get("recipeId");
    if (!recipeId) {
      throw new Error("Recipe ID is required");
    }

    // Check if the recipe is saved in the user's collection
    const searchResponse = await fetch(
      `${STRAPI_URL}/api/saved-recipes?filters[user][id][$eq]=${user.id}&filters[recipe][id][$eq]=${recipeId}`,
      {
        headers: {
          Authorization: `Bearer ${STRAPI_API_TOKEN}`,
        },
        cache: "no-store",
      },
    );

    if (!searchResponse.ok) {
      throw new Error("Failed to search for saved recipe");
    }

    const searchData = await searchResponse.json();

    if (!searchData.data || searchData.data.length === 0) {
      return {
        success: true,
        message: "Recipe not found in your collection.",
      };
    }

    // If the recipe is found, delete it from the user's collection
    const savedRecipeId = searchData.data[0].id;
    const deleteResponse = await fetch(
      `${STRAPI_URL}/api/saved-recipes/${savedRecipeId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${STRAPI_API_TOKEN}`,
        },
      },
    );

    if (!deleteResponse.ok) {
      throw new Error("Failed to remove recipe from collection");
    }

    return {
      success: true,
      message: "Recipe removed from your collection successfully.",
    };
  } catch (error) {
    console.error("Error in removeRecipeFromCollection:", error);
    throw new Error("Failed to remove recipe from collection.");
  }
}

// Get user's saved recipe
export async function getSavedRecipe() {
  try {
    const user = await checkUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const response = await fetch(
      `${STRAPI_URL}/api/saved-recipes?filters[user][id][$eq]=${user.id}&populate[recipe][populate]=*&sort=savedAt:desc`,
      {
        headers: {
          Authorization: `Bearer ${STRAPI_API_TOKEN}`,
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch saved recipes");
    }

    const data = await response.json();
    const recipes = data.data
      .map((savedRecipe) => savedRecipe.recipe)
      .filter(Boolean);

    return {
      success: true,
      recipes,
      count: recipes.length,
    };
  } catch (error) {
    console.error("Error fetching saved recipes: ", error);
    throw new Error(error.message || "Failed to load saved recipes");
  }
}
