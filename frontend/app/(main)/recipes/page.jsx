"use client";

import { getSavedRecipe } from "@/actions/recipe.actions";
import RecipeCard from "@/components/RecipeCard";
import { Button } from "@/components/ui/button";
import useFetch from "@/hooks/use-fetch";
import { Bookmark, ChefHat, Loader2 } from "lucide-react";
import Link from "next/link";
import React, { useEffect } from "react";

const page = () => {
  const {
    loading,
    data: recipesData,
    fn: fetchSavedRecipes,
  } = useFetch(getSavedRecipe);

  useEffect(() => {
    fetchSavedRecipes();
  }, []);

  const recipes = recipesData?.recipes || [];

  return (
    <div className="min-h-screen bg-stone-50 pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center gap-1 mb-8">
          <Bookmark className="w-25 h-25 text-orange-600" />
          <div>
            <h1 className="text-4xl md:text-6xl font-bold text-stone-900 tracking-tight leading-light">My Saved Recipes</h1>
            <p className="text-stone-600">Your personal collection of favourite recipes</p>
          </div>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-orange-600 animate-spin mb-6" />
            <p className="text-stone-600">Loading your saved recipes...</p>
          </div>
        )}

        {!loading && recipes.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6">
            {recipes.map((recipe) => {
              return (
                <RecipeCard
                  key={recipe.documentId}
                  recipe={recipe}
                  variant="list"
                />
              );
            })}
          </div>
        )}

        {!loading && recipes.length === 0 && (
          <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-stone-200">
            <div className="bg-orange-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bookmark className="w-10 h-10 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-stone-900 mb-2">No Saved Recipe</h3>
            <p className="text-stone-600 mb-8 max-w-md mx-auto">
              Start exploring recipes & save your favorites to build your personal cookbook!
            </p>
            <Link href="/dashboard">
              <Button className="bg-orange-600 hover:bg-orange-700 text-white gap-2">
                <ChefHat className="w-4 h-4" />
                Explore Recipes
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default page;
