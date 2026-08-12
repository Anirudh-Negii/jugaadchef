"use server";

const MEALDB_BASE = "https://www.themealdb.com/api/json/v1/1";

// Get random recipe of the day
export async function getRecipeOfTheDay() {
  try {
    const response = await fetch(`${MEALDB_BASE}/random.php`, {
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (!response.ok) {
      throw new Error("Failed to fetch recipe of the day");
    }

    const data = await response.json();
    return {
      success: true,
      recipe: data.meals[0],
    };
  } catch (error) {
    console.error("Error fetching recipe of the day:", error);
    throw new Error(error.message || "Failed to load recipe");
  }
}

// Get all categories
export async function getCategories() {
  try {
    const response = await fetch(`${MEALDB_BASE}/list.php?c=list`, {
      next: { revalidate: 604800 }, // Cache for 1 week , categories don't change often
    });

    if (!response.ok) {
      throw new Error("Failed to fetch categories");
    }

    const data = await response.json();
    return {
      success: true,
      categories: data.meals || [],
    };
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw new Error(error.message || "Failed to load categories");
  }
}

// Get all areas/cuisines
export async function getAreas() {
  try {
    const response = await fetch(`${MEALDB_BASE}/list.php?a=list`, {
      next: { revalidate: 604800 }, // Cache for 1 week
    });

    if (!response.ok) {
      throw new Error("Failed to fetch areas");
    }

    const data = await response.json();
    return {
      success: true,
      areas: data.meals || [],
    };
  } catch (error) {
    console.error("Error fetching areas:", error);
    throw new Error(error.message || "Failed to load areas");
  }
}

// Get meals by category
export async function getMealsByCategory(category) {
  try {
    const response = await fetch(`${MEALDB_BASE}/filter.php?c=${category}`, {
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (!response.ok) {
      throw new Error("Failed to fetch meals");
    }

    const data = await response.json();
    return {
      success: true,
      meals: data.meals || [],
      category,
    };
  } catch (error) {
    console.error("Error fetching meals by category:", error);
    throw new Error(error.message || "Failed to load meals");
  }
}

// Get meals by area
export async function getMealsByArea(area) {
  try {
    const response = await fetch(`${MEALDB_BASE}/filter.php?a=${area}`, {
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (!response.ok) {
      throw new Error("Failed to fetch meals");
    }

    const data = await response.json();
    return {
      success: true,
      meals: data.meals || [],
      area,
    };
  } catch (error) {
    console.error("Error fetching meals by area:", error);
    throw new Error(error.message || "Failed to load meals");
  }
}
