"use client";

import { getMealsByCategory } from "@/actions/mealdb.actions";
import RecipeGrid from "@/components/RecipeGrid";
import { useParams } from "next/navigation";

export default function CategoryRecipesPage() {
  const params = useParams();
  const category = params.category;

  return (
    <RecipeGrid
      type="category"
      value={category}
      displayName={category}
      fetchAction={getMealsByCategory}
      backlink="/dashboard"
    />
  );
}
