"use server";

import { freePantryScan, proTierLimit } from "@/lib/arcjet";
import { checkUser } from "@/lib/checkUser";
import { request } from "@arcjet/next";
import { GoogleGenAI } from "@google/genai";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export async function scanPantryImage(formData) {
  try {
    const user = await checkUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const isPro = user.subscriptionTier === "pro";

    // Determine which Arcjet client to use based on the user's subscription tier
    const arcjetClient = isPro ? proTierLimit : freePantryScan;

    const req = await request();
    const decision = await arcjetClient.protect(req, {
      userId: user.clerkId,
      requested: 1, // Requesting 1 token for the pantry scan
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        throw new Error("Rate limit exceeded");
      }
      throw new Error("Request denied by Arcjet");
    }

    const imageFile = formData.get("image");
    if (!imageFile) {
      throw new Error("No image file provided");
    }

    // Convert the image file to a base64 string
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");

    const prompt = `
      You are a professional chef and ingredient recognition expert. Analyze this image of a pantry/fridge and identify all visible food ingredients.
      Return ONLY a valid JSON array with this exact structure (no markdown, no explanations):
          [
            {
              "name": "ingredient name",
              "quantity": "estimated quantity with unit",
              "confidence": 0.95
            }
          ]

      Rules:
        - Only identify food ingredients (not containers, utensils, or packaging)
        - Be specific (e.g., "Cheddar Cheese" not just "Cheese")
        - Estimate realistic quantities (e.g., "3 eggs", "1 cup milk", "2 tomatoes")
        - Confidence should be 0.7-1.0 (omit items below 0.7)
        - Maximum 20 items
        - Common pantry staples are acceptable (salt, pepper, oil)
    `;

    const result = await genAI.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [
        prompt,
        {
          inlineData: {
          mimeType: imageFile.type,
          data: base64Image,
          },
        },
      ],
    });

    const text = result.text;

    console.log("Gemini raw response:", text);

    let ingredients;
    try {
      // Clean the text to remove any unwanted formatting or characters given by the AI's output
      const cleanText = text
        .replace(/```json\n?/g, "")
        .replace(/```\n?./g, "")
        .trim();
      ingredients = JSON.parse(cleanText);
    } catch (error) {
      console.error("Error parsing JSON from AI response:", error);
      throw new Error("Failed to parse ingredients from AI response");
    }

    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      throw new Error("No ingredients found in the image. Please try a clearer image.");
    }

    return {
      success: true,
      ingredients: ingredients.slice(0, 20),
      scansLimit: isPro ? "unlimited" : 10,
      message: `Found ${ingredients.length} ingredients.`,
    };
  } catch (error) {
    console.error("Error scanning pantry → ", error);
    throw new Error(error.message || "An error occurred while scanning the pantry image");
  }
}

export async function saveToPantry(formData) {
  try {
    const user = await checkUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const ingredientsJson = formData.get("ingredients");
    const ingredients = JSON.parse(ingredientsJson);

    if (!ingredients || ingredients.length === 0) {
      throw new Error("No ingredients provided to save");
    }

    const savedItems = [];

    for (const ingredient of ingredients) {
      const response = await fetch(`${STRAPI_URL}/api/pantry-items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${STRAPI_API_TOKEN}`,
        },
        body: JSON.stringify({
          data: {
            name: ingredient.name,
            quantity: ingredient.quantity,
            imageUrl: "",
            owner: user.id,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        savedItems.push(data.data);
      }
    }

    return {
      success: true,
      savedItems,
      message: `Successfully saved ${savedItems.length} items to your pantry.`,
    };
  } catch (error) {
    console.error("Error saving pantry items → ", error);
    throw new Error(error.message || "An error occurred while saving pantry items");
  }
}

export async function addPantryItemsManually(formData) {
  try {
    const user = await checkUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const name = formData.get("name");
    const quantity = formData.get("quantity");

    if (!name || !quantity) {throw new Error("Name and quantity are required to add an item")}

    const response = await fetch(`${STRAPI_URL}/api/pantry-items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${STRAPI_API_TOKEN}`,
      },
      body: JSON.stringify({
        data: {
          name: name.trim(),
          quantity: quantity.trim(),
          imageUrl: "",
          owner: user.id,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response from Strapi → ", errorText);
      throw new Error("Failed to add item manually. Please check the input and try again.");
    }

    const data = await response.json();

    return {
      success: true,
      item: data.data,
      message: "Item added successfully!",
    };
  } catch (error) {
    console.error("Error adding pantry item manually → ", error);
    throw new Error(error.message || "Failed to add item manually. Please check the input and try again.");
  }
}

export async function getPantryItems() {
  try {
    const user = await checkUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const response = await fetch(
      `${STRAPI_URL}/api/pantry-items?filters[owner][id][$eq]=${user.id}&sort=createdAt:desc`,
      {
        headers: {
          Authorization: `Bearer ${STRAPI_API_TOKEN}`,
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch pantry items. Please try again later.");
    }

    const data = await response.json();
    const isPro = user.subscriptionTier?.toLowerCase() === "pro";

    return {
      success: true,
      items: data.data || [],
      scansLimit: isPro ? "unlimited" : 10,
    };
  } catch (error) {
    console.error("Error fetching pantry items → ", error);
    throw new Error(error.message || "Failed to load pantry. Please try again later.");
  }
}

export async function deletePantryItem(formData) {
  try {
    const user = await checkUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const itemId = formData.get("itemId");
    const response = await fetch(`${STRAPI_URL}/api/pantry-items/${itemId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${STRAPI_API_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete item. Please try again later.");
    }

    return {
      success: true,
      message: "Item removed from pantry",
    };
  } catch (error) {
    console.error("Error deleting pantry item → ", error);
    throw new Error(error.message || "Failed to delete item. Please try again later.");
  }
}

export async function updatePantryItem(formData) {
  try {
    const user = await checkUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const itemId = formData.get("itemId");
    const name = formData.get("name");
    const quantity = formData.get("quantity");

    const response = await fetch(`${STRAPI_URL}/api/pantry-items/${itemId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${STRAPI_API_TOKEN}`,
      },
      body: JSON.stringify({
        data: {
          name,
          quantity,
        },
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to update item. Please try again later.");
    }

    const data = await response.json();

    return {
      success: true,
      item: data.data,
      message: "Item updated successfully",
    };
  } catch (error) {
    console.error("Error updating pantry item → ", error);
    throw new Error(error.message || "Failed to update item. Please try again later.");
  }
}
