import useFetch from "@/hooks/use-fetch";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import React, { useEffect } from "react";
import RecipeCard from "./RecipeCard";

const RecipeGrid = ({ type, value, displayName , fetchAction, backlink = "/dashboard" }) => {
  const { data, loading, fn: fetchMeals } = useFetch(fetchAction);

  // Fetch meals when the value changes
  useEffect(() => {
    if (value) {
      fetchMeals(value);
    }
  }, [value]);

  const meals = data?.meals || [];

  return (
    <div className="min-h-screen bg-stone-50 pt-20 pb-16 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <Link
            href={backlink}
            className="inline-flex items-center gap-2 text-stone-600 hover:text-orange-600 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <h1 className="text-5xl md:text-6xl font-bold text-stone-900 capitalize tracking-light leading-tight">
            {displayName}{" "}
            <span className="text-orange-600">
              {type === "cuisine" ? "Cuisine" : "Recipes"}
            </span>
          </h1>

          {!loading && meals.length > 0 && (
            <p className="text-stone-600 mt-2">
              {meals.length} delicious {displayName}{" "}
              {type === "cuisine" ? "cuisine" : "recipes"} to explore.
            </p>
          )}

          {/* Loading State for dishes */}
          {loading && (
            <div className="flex flex-col justify-center items-center py-20">
              <Loader2 className="w-10 h-10 text-orange-600 animate-spin mb-4" />
              <p className="text-stone-500">Loading {displayName} recipes...</p>
            </div>
          )}

          {!loading && meals.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
              {meals.map((meal) => (
                <RecipeCard key={meal.idMeal} recipe={meal} variant="grid" />
              ))}
            </div>
          )}

          {!loading && meals.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🍽️</div>
              <h3 className="text-2xl font-bold text-stone-900 mb-2">
                No recipe found
              </h3>
              <p className="text-stone-500 mb-6">
                We couldn&apos;t find any {displayName}{" "}
                {type === "cuisine" ? "dishes" : "recipes"}.
              </p>
              <Link href={backlink}>
                <span className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold">
                  <ArrowLeft className="w-4 h-4" /> Go back to explore more
                </span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeGrid;
