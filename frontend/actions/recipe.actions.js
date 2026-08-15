"use server";

import { freeMealRecommendations, proTierLimit } from "@/lib/arcjet";
import { checkUser } from "@/lib/checkUser";
import { request } from "@arcjet/next";
import { GoogleGenAI } from "@google/genai";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

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

// Helper functions to fetch image from Unsplash
async function fetchRecipeImage(recipeName) {}

// Generate recipe from Gemini or fetch from Strapi if it already exists
export async function getOrGenerateRecipe(formData) {}

// Save recipe to user's collection (bookmark)
export async function saveRecipeToCollection(formData) {}

// Remove recipe from user's collection (unbookmark)
export async function removeRecipeFromCollection(formData) {}
