import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 font-heading text-4xl font-bold md:text-5xl">About WEZZA</h1>

        <div className="prose prose-lg max-w-none">
          <p className="text-xl leading-relaxed text-muted-foreground">
            Built to live in. That's our philosophy at WEZZA.
          </p>

          <div className="my-12 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-black to-brand-orange p-12 text-white">
            <h2 className="font-heading text-3xl font-bold">Our Story</h2>
            <p className="mt-4 text-lg leading-relaxed opacity-90">
              WEZZA was founded on the belief that everyday clothing should be exceptional.
              We saw a gap in the market for hoodies that combined premium quality with
              minimalist design—pieces you'd actually want to wear every day.
            </p>
          </div>

          <h2 className="font-heading text-3xl font-bold">Premium Materials</h2>
          <p>
            Every WEZZA hoodie is crafted from 350gsm heavyweight cotton—the same grade used
            by luxury streetwear brands. This isn't your average hoodie material. It's
            substantial, durable, and gets softer with every wash while maintaining its shape.
          </p>

          <h2 className="mt-12 font-heading text-3xl font-bold">Design Philosophy</h2>
          <p>
            We believe in minimalism without compromise. Clean lines, bold fits, and timeless
            colorways that never go out of style. No excessive branding, no unnecessary details—
            just pure, refined streetwear.
          </p>

          <h2 className="mt-12 font-heading text-3xl font-bold">Sustainability</h2>
          <p>
            Quality over quantity. By creating hoodies built to last years instead of seasons,
            we're doing our part to reduce fast fashion waste. Every piece is made to withstand
            the test of time—both in durability and style.
          </p>

          <div className="mt-12 rounded-2xl bg-brand-peach/20 p-8 text-center">
            <p className="font-heading text-2xl font-bold">Built to live in.</p>
            <p className="mt-2 text-muted-foreground">
              That's not just a tagline—it's a promise.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
