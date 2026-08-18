import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="w-full max-w-4xl text-center">
        <div className="flex justify-center">
          <Image
            src="/logo.png"
            alt="JugaadChef"
            width={250}
            height={60}
            className="w-62 h-auto object-contain"
            priority
          />
        </div>

        <p className="text-5xl md:text-7xl font-bold text-orange-600 tracking-tight leading-none mb-3">
          404
        </p>

        <h1 className="text-3xl md:text-5xl font-bold text-stone-900 tracking-tight mb-4">Looks Like This Recipe Got Lost</h1>
        <p className="text-stone-600 text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-7">
          We couldn&apos;t find the page you&apos;re looking for. It may have
          been moved, removed, or perhaps our AI Chef hasn&apos;t cooked it yet.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/">
            <Button className="bg-orange-600 hover:bg-orange-700 text-white gap-2 h-11 px-6">
              <Home className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>

          <Link href="/dashboard">
            <Button
              variant="outline"
              className="border-stone-300 hover:bg-stone-800 text-stone-800 hover:text-white gap-2 h-11 px-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
