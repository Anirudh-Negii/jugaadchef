"use client";

import { getMealsByArea } from "@/actions/mealdb.actions";
import RecipeGrid from "@/components/RecipeGrid";
import { cuisineAliases } from "@/lib/data";
import { useParams } from "next/navigation";

export default function CuisineRecipesPage() {
  const params = useParams();
  const cuisine = cuisineAliases[params.cuisine.toLowerCase()];

  return (
    <RecipeGrid
      type="cuisine"
      value={cuisine.api}
      displayName={cuisine.display}
      fetchAction={getMealsByArea}
      backlink="/dashboard"
    />
  );
}
