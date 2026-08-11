import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-sreen bg-stone-50 text-stone-900">
      <section className="pt-32 pb-20 px-4">
        <Button variant="primary" size="xl" className="cursor-pointer">
          Click Me
        </Button>
      </section>
    </div>
  );
}
