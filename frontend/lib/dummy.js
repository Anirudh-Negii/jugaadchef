// lib/dummyRecipe.js
// Matches the server action response structure from getOrGenerateRecipe

export const DUMMY_RECIPE_RESPONSE = {
  success: true,
  recipe: {
    id: 1,
    documentId: "recipe_1",
    title: "Butter Chicken",
    description: "A rich and creamy North Indian curry with tender chicken in a tomato-based sauce. This restaurant-style dish is perfect for special occasions and pairs beautifully with naan or basmati rice.",
    cuisine: "indian",
    category: "dinner",
    imageUrl: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800",

    ingredients: [
      { item: "Chicken breast", amount: "500g", category: "Protein" },
      { item: "Greek yogurt", amount: "1/2 cup", category: "Dairy" },
      { item: "Heavy cream", amount: "1/2 cup", category: "Dairy" },
      { item: "Butter", amount: "4 tbsp", category: "Dairy" },
      { item: "Tomato puree", amount: "400g", category: "Vegetable" },
      { item: "Onion", amount: "1 large", category: "Vegetable" },
      { item: "Ginger-garlic paste", amount: "2 tbsp", category: "Spice" },
      { item: "Garam masala", amount: "2 tsp", category: "Spice" },
      { item: "Kashmiri red chili powder", amount: "1 tsp", category: "Spice" },
      { item: "Turmeric powder", amount: "1/2 tsp", category: "Spice" },
      { item: "Cumin powder", amount: "1 tsp", category: "Spice" },
      { item: "Kasuri methi (dried fenugreek)", amount: "1 tbsp", category: "Spice" },
      { item: "Salt", amount: "to taste", category: "Other" },
      { item: "Vegetable oil", amount: "2 tbsp", category: "Other" },
      { item: "Fresh cilantro", amount: "for garnish", category: "Other" },
    ],

    instructions: [
      {
        step: 1,
        title: "Marinate the Chicken",
        instruction: "Cut the chicken into bite-sized pieces. In a bowl, mix yogurt with 1 tsp garam masala, 1/2 tsp chili powder, and salt. Add chicken pieces and marinate for at least 30 minutes (or up to 4 hours in the refrigerator).",
        tip: "For extra tender chicken, marinate overnight in the refrigerator.",
      },
      {
        step: 2,
        title: "Cook the Chicken",
        instruction: "Heat 1 tbsp oil in a large pan over medium-high heat. Add marinated chicken and cook for 6-8 minutes until lightly charred and cooked through. Remove and set aside.",
        tip: "Don't overcrowd the pan - cook in batches if needed for better browning.",
      },
      {
        step: 3,
        title: "Prepare the Base",
        instruction: "In the same pan, add 2 tbsp butter. Once melted, add finely chopped onions and cook until golden brown (about 8-10 minutes). Add ginger-garlic paste and cook for 2 minutes until fragrant.",
        tip: null,
      },
      {
        step: 4,
        title: "Build the Sauce",
        instruction: "Add tomato puree, remaining spices (chili powder, turmeric, cumin, garam masala), and salt. Cook for 10-12 minutes on medium heat, stirring occasionally, until the oil separates from the masala.",
        tip: "This step is crucial - cooking the masala properly removes the raw tomato taste.",
      },
      {
        step: 5,
        title: "Add Cream and Chicken",
        instruction: "Lower the heat and stir in the heavy cream. Add the cooked chicken pieces and simmer for 5-7 minutes, allowing the flavors to meld together.",
        tip: null,
      },
      {
        step: 6,
        title: "Final Touch",
        instruction: "Crush the kasuri methi between your palms and add to the curry. Add remaining 2 tbsp butter and stir gently. Simmer for 2 more minutes.",
        tip: "Crushing the kasuri methi releases its aromatic oils and enhances the flavor.",
      },
      {
        step: 7,
        title: "Garnish and Serve",
        instruction: "Turn off the heat. Garnish with fresh cilantro and a swirl of cream. Serve hot with naan, roti, or basmati rice.",
        tip: null,
      },
    ],

    prepTime: 20,
    cookTime: 40,
    servings: 4,

    nutrition: {
      calories: "420",
      protein: "32g",
      carbs: "18g",
      fat: "26g",
      fiber: "3g",
      sugar: "8g",
    },

    tips: [
      "For a smokier flavor, char the chicken on a grill or under the broiler before adding to the sauce.",
      "Adjust the chili powder based on your spice preference - Kashmiri chili is mild and adds color.",
      "Use full-fat dairy products for the richest, creamiest texture.",
      "Leftover butter chicken tastes even better the next day as flavors develop overnight.",
      "If the sauce is too thick, add a splash of water or chicken stock to thin it out.",
    ],

    substitutions: [
      {
        original: "Heavy cream",
        alternatives: ["Coconut cream", "Cashew cream", "Half-and-half"],
      },
      {
        original: "Kasuri methi",
        alternatives: [
          "Fresh fenugreek leaves",
          "Dried oregano (different flavor)",
        ],
      },
      {
        original: "Greek yogurt",
        alternatives: [
          "Regular yogurt",
          "Sour cream",
          "Coconut yogurt (dairy-free)",
        ],
      },
      {
        original: "Chicken breast",
        alternatives: ["Chicken thighs", "Paneer (vegetarian)", "Tofu (vegan)"],
      },
    ],

    isPublic: true,
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
  },
  recipeId: 1,
  isSaved: false,
  fromDatabase: false,
  recommendationsUsed: 3,
  recommendationsLimit: 5,
  message: "Recipe loaded successfully!",
};
