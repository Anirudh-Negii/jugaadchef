import { Button } from "@/components/ui/button";
import { auth } from "@clerk/nextjs/server";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Clock, Flame, Star, Users } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

export default async function Home() {
  const { has } = await auth();
  const subscriptionTier = has({ plan: "pro" }) ? "pro" : "free";

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
            <div className="flex-1 text-center md:text-left">
              <Badge
                variant="outline"
                className="border-2  border-orange-600 text-orange-700 bg-orange-100 text-sm font-bold uppercase tracking wider"
              >
                <Flame className="mr-1" />
                #1 AI Cooking Assistant
              </Badge>

              <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-[0.9] tracking-light">
                Turn your{" "}
                <span className="italic underline decoration-4 decoration-orange-600">
                  leftovers
                </span>{" "}
                into <br /> masterpieces
              </h1>

              <p className="text-xl md:text-2xl text-stone-600 mb-10 max-w-lg mx-auto md:mx-0 font-light">
                Snap a photo of your fridge. We&apos;ll tell you what to cook.
                Save money reduce waste and eat better with JugaadChef.
              </p>

              <Link href={"/dashboard"}>
                <Button
                  size="xl"
                  variant="primary"
                  className="px-8 py-6 text-lg rounded-full"
                >
                  Start Cooking Free <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>

              <p className="mt-6 text-sm text-stone-500">
                <span className="font-bold text-stone-900">
                  10K+ JugaadChefs
                </span>{" "}
                are already cooking smarter!
              </p>
            </div>

            <Card
              className={
                "relative aspect-square md:aspect-4/5 border-4 border-stone-900 bg-stone-200 overflow-hidden py-0"
              }
            >
              <Image
                src="/pasta-dish.png"
                alt="Pasta Image"
                width={500}
                height={500}
                className="w-full h-full object-cover"
              />

              <Card className="absolute bottom-8 left-8 right-8 bg-white/95 backdrop-blur-sm border-2 border-stone-900 py-0">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg">
                        Rustic Garlic Cheese Pasta
                      </h3>
                      <div className="flex gap-0.5 mt-1">
                        {[...Array(5)].map((_, index) => (
                          <Star
                            key={index}
                            className="w-4 h-4 text-orange-500 fill-orange-600"
                          />
                        ))}
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-2 border-green-700 bg-green-50 text-green-700 font-bold"
                    >
                      98% Match
                    </Badge>
                  </div>
                  <div className="flex gap-4 text-xs text-stone-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      25min
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      2 Servings
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
