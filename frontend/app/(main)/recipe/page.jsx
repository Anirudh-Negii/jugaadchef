"use client";

import { getOrGenerateRecipe, removeRecipeFromCollection, saveRecipeToCollection } from "@/actions/recipe.actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import useFetch from "@/hooks/use-fetch";
import { AlertCircle, ArrowLeft, Bookmark, BookmarkCheck, ChefHat, Clock, Flame, Loader2, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";
import { ClockLoader } from "react-spinners";
import { toast } from "sonner";

function RecipeContent() {
  const searchParams = useSearchParams();
  const recipeName = searchParams.get("cook");
  const router = useRouter();

  const [recipe, setRecipe] = useState(null);
  const [recipeId, setRecipeId] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

  // Fetch or generate the recipe data using the recipe name
  const {
    loading: loadingRecipe,
    data: recipeData,
    fn: fetchRecipe,
  } = useFetch(getOrGenerateRecipe);

  // Save the recipe to the user's collection
  const {
    loading: saving,
    data: saveData,
    fn: saveToCollection,
  } = useFetch(saveRecipeToCollection);

  // Remove the recipe from the user's collection
  const {
    loading: removing,
    data: removeData,
    fn: removeFromCollection,
  } = useFetch(removeRecipeFromCollection);

  useEffect(() => {
    if (saveData?.success) {
      if (saveData.alreadySaved) {
        toast.info("Recipe is already in your collection!");
      } else {
        setIsSaved(true);
        toast.success("Recipe saved to your collection!");
      }
    }
  }, [saveData]);

  useEffect(() => {
    if (removeData?.success) {
      setIsSaved(false);
      toast.success("Recipe removed from your collection!");
    }
  }, [removeData]);

  // Handle save/remove button click
  const handleToggleSave = async () => {
    if (!recipeId) return;

    const formData = new FormData();
    formData.append("recipeId", recipeId);

    if (isSaved) {
      await removeFromCollection(formData);
    } else {
      await saveToCollection(formData);
    }
  };

  // Fetch the recipe on mount
  useEffect(() => {
    if (recipeName && !recipe) {
      const formData = new FormData();
      formData.append("recipeName", recipeName);
      fetchRecipe(formData);
    }
  }, [recipeName]);

  // Update the recipe when recipeData arrives
  useEffect(() => {
    if (recipeData?.success) {
      setRecipe(recipeData.recipe);
      setRecipeId(recipeData.recipe.id);
      setIsSaved(recipeData.isSaved);

      if (recipeData.fromDatabase) {
        toast.success("Recipe fetched from database!");
      } else {
        toast.success("New recipe generated and saved successfully!");
      }
    }
  }, [recipeData]);

  // If no recipe name is in the URl
  if (!recipeName) {
    return (
      <div className="min-h-screen bg-stone-50 pt-24 pb-16">
        <div className="container mx-auto max-w-4xl text-center py-20">
          <div className="bg-orange-50 w-20 h-20 border-2 border-orange-200 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-stone-900 mb-2">No Recipe Specified</h2>
          <p className="text-stone-600 mb-6 font-light">Please select a recipe from the dashboard</p>
          <Link href="/dashboard">
            <Button className="bg-orange-600 hover:bg-orange-700">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loadingRecipe === null || loadingRecipe) {
    return (
      <div className="min-h-screen bg-stone-50 pt-24 pb-16">
        <div className="container mx-auto max-w-4xl text-center py-20">
          <ClockLoader className="mx-auto mb-6" color="#dc6300" />
          <h2 className="text-3xl font-bold text-stone-900 mb-2 tracking-light">Preparing Your Recipe</h2>
          <p className="text-stone-600 font-light">
            Our AI Chef is crafting detailed instructions for{" "}
            <span className="font-bold text-orange-600">{recipeName}</span>
            ...
          </p>
          <div className="mt-8 max-w-md mx-auto">
            <div className="flex items-center gap-3 text-sm text-stone-500">
              <div className="flex-1 h-1 bg-stone-200 overflow-hidden relative">
                <div className="absolute left-0 top-0 h-full bg-orange-600 animate-slow-fill" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loadingRecipe === false && !recipe) {
    return (
      <div className="min-h-screen bg-stone-50 pt-24 pb-16">
        <div className="container mx-auto max-w-4xl text-center py-20">
          <div className="bg-red-50 w-20 h-20 border-2 border-red-200 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-stone-900 mb-2">Failed to Load Recipe</h2>
          <p className="text-stone-600 mb-6 font-light">We couldn't find the recipe you're looking for. Please try again.</p>

          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="border-2 border-stone-900 hover:bg-stone-900hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
            <Button
              onClick={() => window.location.reload()}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pt-24 pb-16">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-stone-600 hover:text-orange-600 transition-colors mb-6 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="bg-white p-8 md:p-10 border-2 border-stone-200 mb-6">
            {recipe.imageUrl && (
              <div className="relative w-full h-72 overflow-hidden mb-7">
                <Image
                  src={recipe.imageUrl}
                  alt={recipe.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                  priority
                />
              </div>
            )}

            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="outline" className="text-orange-600 border-2 border-orange-200 capitalize">
                {recipe.cuisine}
              </Badge>
              <Badge variant="outline" className="text-stone-600 border-2 border-orange-200 capitalize">
                {recipe.category}
              </Badge>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-stone-900 mb-4 tracking-tight">{recipe.title}</h1>
            <p className="text-lg text-stone-600 mb-6 font-light">{recipe.description}</p>

            <div className="flex flex-wrap gap-6 text-stone-600 mb-6">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600" />
                <span className="font-medium">
                  {parseInt(recipe.prepTime) + parseInt(recipe.cookTime)} mins
                  total
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-600" />
                <span className="font-medium">{recipe.servings} servings</span>
              </div>

              {recipe.nutrition?.calories && (
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-600" />
                  <span className="font-medium">
                    {recipe.nutrition.calories} cal/serving
                  </span>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleToggleSave}
                disabled={saving || removing}
                className={`${
                  isSaved
                    ? "bg-green-600 hover:bg-green-700 border-2 border-green-700"
                    : "bg-orange-600 hover:bg-orange-700 border-2 border-orange-700"
                } text-white gap-2 transition-all`}
              >
                {saving || removing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {saving ? "Saving..." : "Removing..."}
                  </>
                ) : isSaved ? (
                  <>
                    <BookmarkCheck className="w-4 h-4" />
                    Saved to Collection
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4" />
                    Save to Collection
                  </>
                )}
              </Button>

              {/* Add PDF Download Button later */}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Ingredients & Nutrition */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 border-2 border-stone-200 lg:sticky lg:top-24">
              <h2 className="text-2xl font-bold text-stone-900 mb-4 flex items-center gap-2">
                <ChefHat className="w-6 h-6 text-orange-600" />
                Ingredients
              </h2>

              {Object.entries(
                recipe.ingredients.reduce((acc, ing) => {
                  const cat = ing.category || "Other";
                  if (!acc[cat]) acc[cat] = [];
                  acc[cat].push(ing);
                  return acc;
                }, {}),
              ).map(([category, items]) => (
                <div key={category} className="mb-6 last:mb-0">
                  <h3 className="text-sm font-bold text-stone-500 uppercase tracking-wide mb-3 border-b border-stone-500">{category}</h3>

                  <ul className="space-y-2">
                    {items.map((ingredient, i) => (
                      <li key={i} className="flex justify-center items-start gap-2 text-stone-700 py-2">
                        <span className="flex-1">{ingredient.item}</span>
                        <span className="font-bold text-orange-600 text-sm whitespace-nowrap">{ingredient.amount}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {/* PRO FEATURE */}
              {recipe.nutrition && (
                <div className="mt-6 pt-6 border-t-2 border-stone-500">
                  <h3 className="font-bold text-stone-900 mb-3 uppercase tracking-wide text-sm">Nutrition (per serving)</h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-orange-100 p-3 text-center border-2 border-orange-100">
                      <div className="text-2xl font-bold text-orange-600">{recipe.nutrition.calories}</div>
                      <div className="text-xs text-stone-500 font-bold uppercase tracking-wide">Calories</div>
                    </div>

                    <div className="bg-stone-50 p-3 text-center border-2 border-stone-100">
                      <div className="text-2xl font-bold text-stone-900">{recipe.nutrition.protein}</div>
                      <div className="text-xs text-stone-500 font-bold uppercase tracking-wide">Protein</div>
                    </div>

                    <div className="bg-stone-50 p-3 text-center border-2 border-stone-100">
                      <div className="text-2xl font-bold text-stone-900">{recipe.nutrition.carbs}</div>
                      <div className="text-xs text-stone-500 font-bold uppercase tracking-wide">Carbs</div>
                    </div>

                    <div className="bg-stone-50 p-3 text-center border-2 border-stone-100">
                      <div className="text-2xl font-bold text-stone-900">{recipe.nutrition.fat}</div>
                      <div className="text-xs text-stone-500 font-bold uppercase tracking-wide">Fat</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Instructions & Tips */}
          <div className="lg:col-span-2 space-y-6"></div>
        </div>
      </div>
    </div>
  );
}

export default function RecipePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-stone-50 pt-24 pb-16 px-4">
          <div className="container mx-auto max-w-4xl text-center py-20">
            <Loader2 className="w-16 h-16 text-orange-600 animate-spin mx-auto mb-6" />
            <p className="text-stone-600">Loading recipe...</p>
          </div>
        </div>
      }
    >
      <RecipeContent />
    </Suspense>
  );
}
