import { getAreas, getCategories, getRecipeOfTheDay } from "@/actions/mealdb.actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Flame, Globe } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const DashboardPage = async () => {
  const recipeData = await getRecipeOfTheDay();
  const categoriesData = await getCategories();
  const areasData = await getAreas();

  const recipeOfTheDay = recipeData?.recipe;
  const categories = categoriesData?.categories || [];
  const areas = areasData?.areas || [];

  return (
    <div className="min-h-screen bg-stone-50 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-5">
          <h1 className="text-5xl md:text-7xl font-bold text-stone-900 mb-4 tracking-light leading-tight">
            Fresh Recipes, Every Day
          </h1>
          <p className="text-xl text-stone-600 font-light max-w-2xl">
            Discover thousands of recipes from around the world. Cook, create & savor.
          </p>
        </div>

        {/* Recipe of the Day Section */}
        {recipeOfTheDay && (
          <section className="mb-24 relative">
            <div className="flex items-center gap-2 mb-6">
              <Flame className="w-6 h-6 text-orange-600 fill-orange-600" />
              <h2 className="text-3xl font-sherif font-bold text-stone-900">Recipe of the day</h2>
            </div>

            <Link
              href={`/recipe?cook=${encodeURIComponent(recipeOfTheDay.strMeal)}`}
            >
              <div className="relative bg-white border-2 border-stone-900 overflow-hidden hover:border-orange-600 hover:shadow-lg transition-all duration-300 group cursor-pointer">
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="relative aspect-4/3 md:aspect-auto border-b-2 md:border-b-0 md:border-r-2 border-stone-900">
                    <Image src={recipeOfTheDay.strMealThumb} alt={recipeOfTheDay.strMeal} fill className="object-cover" />
                  </div>

                  <div className="p-8 md:p-12 flex flex-col justify-center">
                    <div className="flex flex-wrap gap-2 mb-6">
                      <Badge variant="outline" className="border-2 border-orange-600 text-orange-700 bg-orange-50 font-bold">
                        {recipeOfTheDay.strCategory}
                      </Badge>
                      <Badge variant="outline" className="border-2 border-stone-900 text-stone-700 bg-orange-50 font-bold">
                        <Globe className="w-4 h-4 mr-1" />
                        {recipeOfTheDay.strArea}
                      </Badge>
                    </div>

                    <h3 className="text-4xl md:text-5xl font-bold text-stone-900 mb-4 group-hover:text-orange-600 transition-colors leading-tight">
                      {recipeOfTheDay.strMeal}
                    </h3>
                    <p className="text-stone-600 mb-6 line-clamp-3 font-light text-lg">
                      {recipeOfTheDay.strInstructions?.substring(0, 200)}...
                    </p>

                    <Button variant="primary" size="lg" className="rounded-full cursor-pointer">
                      Start Cooking <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* Browse by Category Section */}

        {/* Browse by Area Section */}
      </div>
    </div>
  );
};

export default DashboardPage;
