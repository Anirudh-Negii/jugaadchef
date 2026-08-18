import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { ClerkProvider } from "@clerk/nextjs";
import { neobrutalism } from "@clerk/ui/themes";
import { Toaster } from "@/components/ui/sonner";
import Image from "next/image";
import { Heart } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "JugaadChef - AI Recipe Platform",
  description:
    "Turn what you have into what you crave with AI-powered recipes.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider appearance={{ theme: neobrutalism }}>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className}`}>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Toaster richColors />
          <footer className="border-t border-stone-200 bg-stone-50 px-4 py-3">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
              <Image
                src="/logo.png"
                alt="JugaadChef"
                width={100}
                height={30}
                className="w-25 h-auto object-contain"
              />

              <div className="flex items-center gap-1.5 text-sm text-stone-500">
                Made with
                <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                by Anirudh
              </div>

              <p className="text-xs text-stone-500">
                © {new Date().getFullYear()} JugaadChef
              </p>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
