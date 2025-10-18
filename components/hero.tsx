import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getContentBySection } from "@/lib/site-content";

export async function Hero() {
  const content = await getContentBySection("hero");

  return (
    <section className="relative h-[500px] overflow-hidden bg-gradient-to-br from-brand-black via-brand-black to-brand-orange sm:h-[600px] md:h-[700px]">
      <div className="container relative z-10 mx-auto flex h-full flex-col items-center justify-center px-4 text-center text-white">
        <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl md:text-7xl">
          {content["hero.title"] || "BUILT TO LIVE IN"}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed sm:mt-6 sm:text-lg md:text-xl">
          {content["hero.description"] || "Premium heavyweight cotton hoodies. Minimal design, maximum comfort. Streetwear that moves with you."}
        </p>
        <div className="mt-8 flex w-full max-w-md flex-col gap-3 px-4 sm:mt-10 sm:flex-row sm:gap-4 sm:px-0">
          <Link href="/shop" className="w-full sm:w-auto sm:flex-1">
            <Button size="lg" variant="default" className="w-full bg-white text-black hover:bg-brand-peach">
              {content["hero.cta.shop"] || "Shop Hoodies"}
            </Button>
          </Link>
          <Link href="/custom" className="w-full sm:w-auto sm:flex-1">
            <Button size="lg" variant="outline" className="w-full border-2 border-white bg-transparent text-white hover:bg-white hover:text-black">
              {content["hero.cta.custom"] || "Custom Orders"}
            </Button>
          </Link>
        </div>
      </div>
      <div className="absolute inset-0 bg-black/20" />
    </section>
  );
}
