import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative h-[600px] overflow-hidden bg-gradient-to-br from-brand-black via-brand-black to-brand-orange md:h-[700px]">
      <div className="container relative z-10 mx-auto flex h-full flex-col items-center justify-center px-4 text-center text-white">
        <h1 className="font-heading text-5xl font-bold tracking-tight md:text-7xl">
          BUILT TO LIVE IN
        </h1>
        <p className="mt-6 max-w-2xl text-lg md:text-xl">
          Premium heavyweight cotton hoodies. Minimal design, maximum comfort.
          Streetwear that moves with you.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link href="/shop">
            <Button size="lg" variant="default" className="bg-white text-black hover:bg-brand-peach">
              Shop Hoodies
            </Button>
          </Link>
          <Link href="/custom">
            <Button size="lg" variant="outline" className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-black">
              Custom Orders
            </Button>
          </Link>
        </div>
      </div>
      <div className="absolute inset-0 bg-black/20" />
    </section>
  );
}
