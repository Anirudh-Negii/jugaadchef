"use server";

import { freePantryScan, proTierLimit } from "@/lib/arcjet";
import { checkUser } from "@/lib/checkUser";
import { request } from "@arcjet/next";
import { GoogleGenAI } from "@google/genai";

const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const genAI = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
});

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
    const decision = await arcjetClient(req, {
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

    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
    });

    const prompt = ``;
  } catch (error) {
    throw new Error("Error processing image");
  }
}
