import Link from "next/link";
import Image from "next/image";
import { Clock, Users, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const RecipeCard = ({ recipe, variant = "default" }) => {
  const getRecipeData = () => {
    // For MealDB recipes
    if (recipe.strMeal) {
      return {
        title: recipe.strMeal,
        image: recipe.strMealThumb,
        href: `/recipe?cook=${encodeURIComponent(recipe.strMeal)}`,
        showImage: true,
      };
    }

    if (recipe.matchPercentage) {
      return {
        title: recipe.title,
        description: recipe.description,
        category: recipe.category,
        cuisine: recipe.cuisine,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        servings: recipe.servings,
        matchPercentage: recipe.matchPercentage,
        missingIngredients: recipe.missingIngredients,
        image: recipe.imageUrl,
        href: `/recipe?cook=${encodeURIComponent(recipe.title)}`,
        showImage: !!recipe.imageUrl,
      };
    }
    return {};
  };

  const data = getRecipeData();

  // Grid variant — used for MealDB recipes in category/cuisine recipe listings
  if (variant === "grid") {
    return (
      <Link href={data.href} className="block h-full">
        <Card className="h-full rounded-none overflow-hidden border-stone-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group pt-0">
          {data.showImage ? (
            <div className="relative aspect-square">
              <Image
                src={data.image}
                alt={data.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />

              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white text-sm font-medium">Click to view recipe</p>
                </div>
              </div>
            </div>
          ) : (
            <div></div>
          )}

          <CardHeader className="flex-1">
            <CardTitle className="min-h-14 text-lg font-bold leading-tight text-stone-900 group-hover:text-orange-600 transition-colors line-clamp-2">
              {data.title}
            </CardTitle>
          </CardHeader>
        </Card>
      </Link>
    );
  }

  // Pantry variant — used for AI/pantry-based recipe recommendations
  if (variant === "pantry") {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-3">
                {data.cuisine && (
                  <Badge variant="outline" className="text-orange-600 border-orange-200 capitalize">
                    {data.cuisine}
                  </Badge>
                )}
                {data.category && (
                  <Badge variant="outline" className="text-stone-600 border-stone-200 capitalize">
                    {data.category}
                  </Badge>
                )}
              </div>
            </div>

            {/* Match % badge */}
            {data.matchPercentage && (
              <div className="flex- flex-col items-end gap-1">
                <Badge
                  className={`${
                    data.matchPercentage >= 90
                      ? "text-green-600"
                      : data.matchPercentage >= 75
                        ? "bg-orange-600"
                        : "bg-stone-600"
                  } text-white text-lg px-3 py-1`}
                >
                  {data.matchPercentage}%
                </Badge>
                <span className="text-xs text-stone-500">Match</span>
              </div>
            )}
          </div>
          <CardTitle className="text-2xl font-serif font-bold text-stone-900">
            {data.title}
          </CardTitle>

          {data.description && (
            <CardDescription className="text-stone-600 leading-relaxed mt-2">
              {data.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4 flex-1">
          {(data.prepTime || data.cookTime || data.servings) && (
            <div className="flex gap-4 text-sm text-stone-500">
              {(data.prepTime || data.cookTime) && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>
                    {parseInt(data.prepTime || 0) +
                      parseInt(data.cookTime || 0)}{" "}
                    mins
                  </span>
                </div>
              )}
              {data.servings && (
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{data.servings} servings</span>
                </div>
              )}
            </div>
          )}

          {data.missingIngredients && data.missingIngredients.length > 0 && (
            <div className="p-4 bg-orange-50 border border-orange-100">
              <h4 className="text-sm font-semibold text-orange-900 mb-2">
                You&apos;ll need:{" "}
              </h4>
              <div className="flex flex-wrap gap-2">
                {data.missingIngredients.map((ingredient, i) => (
                  <Badge
                    key={i}
                    varaint="outline"
                    className="bg-white text-orange-700 border-orange"
                  >
                    {ingredient}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Link href={data.href} className="w-full">
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white gap-2">
              <ChefHat className="w-4 h-4" />
              View Recipe
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return <div>Recipe Card</div>;
};

export default RecipeCard;
