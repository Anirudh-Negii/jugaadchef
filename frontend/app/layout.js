import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "JugaadChef - AI Recipe Platform",
  description:
    "Turn what you have into what you crave with AI-powered recipes.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className}`}>
          <Header />
          <main className="min-h-screen">{children}</main>
          <footer className="py-8 px-4 border-t">
            <div className="max-w-6xl mx-auto flex justify-center items-center">
              Made with ❤️ by Anirudh
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
