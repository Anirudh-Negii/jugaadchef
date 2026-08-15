"use server";

import { freeMealRecommendations, proTierLimit } from "@/lib/arcjet";
import { checkUser } from "@/lib/checkUser";
import { request } from "@arcjet/next";
import { GoogleGenAI } from "@google/genai";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
import { DUMMY_RECIPE_RESPONSE } from "@/lib/dummy";

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

// Helper functions to fetch image from Unsplash
async function fetchRecipeImage(recipeName) {}

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

    // Normalize the recipe title to create a slug
    const normalizedTitle = normalizeTitle(recipeName);

    // Step 1 - Check if the recipe already exists in Strapi
    // Step 2 - If recipe does not exist, generate it using Gemini API
    // Step 3 - Fetch an image for the recipe from Unsplash
    // Step 4 - Save the new recipe to Strapi Database

    // Using this return for now so we dont have to call the Gemini API every time we want to test the recipe page. This will be replaced with the actual recipe data once the above steps are implemented.
    return DUMMY_RECIPE_RESPONSE;
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
