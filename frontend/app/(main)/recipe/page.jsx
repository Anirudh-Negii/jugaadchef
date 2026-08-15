"use client";

import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import React, { Suspense } from "react";

function RecipeContent() {
  const searchParams = useSearchParams();
  const recipeName = searchParams.get("cook");

  return (
    <div className="min-h-screen bg-stone-50 pt-24 pb-16">
      <div className="container mx-auto max-w-4xl">
        {recipeName}
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
