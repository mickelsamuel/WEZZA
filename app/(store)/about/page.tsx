import Image from "next/image";
import { getContentBySection } from "@/lib/site-content";

export default async function AboutPage() {
  const content = await getContentBySection("about");

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 font-heading text-3xl font-bold sm:mb-8 sm:text-4xl md:text-5xl">
          {content["about.pageTitle"] || "About WEZZA"}
        </h1>

        <div className="prose prose-lg max-w-none">
          <p className="text-base leading-relaxed text-muted-foreground sm:text-lg md:text-xl">
            {content["about.intro"] || "Built to live in. That's our philosophy at WEZZA."}
          </p>

          <div className="my-8 overflow-hidden rounded-xl bg-gradient-to-br from-brand-black to-brand-orange p-6 text-white sm:my-12 sm:rounded-2xl sm:p-12">
            <h2 className="font-heading text-2xl font-bold sm:text-3xl">
              {content["about.story.title"] || "Our Story"}
            </h2>
            <p className="mt-3 text-base leading-relaxed opacity-90 sm:mt-4 sm:text-lg">
              {content["about.story.content"] || "WEZZA was founded on the belief that everyday clothing should be exceptional. We saw a gap in the market for hoodies that combined premium quality with minimalist design—pieces you'd actually want to wear every day."}
            </p>
          </div>

          <h2 className="font-heading text-2xl font-bold sm:text-3xl">
            {content["about.materials.title"] || "Premium Materials"}
          </h2>
          <p className="text-sm sm:text-base">
            {content["about.materials.content"] || "Every WEZZA hoodie is crafted from 350gsm heavyweight cotton—the same grade used by luxury streetwear brands. This isn't your average hoodie material. It's substantial, durable, and gets softer with every wash while maintaining its shape."}
          </p>

          <h2 className="mt-8 font-heading text-2xl font-bold sm:mt-12 sm:text-3xl">
            {content["about.philosophy.title"] || "Design Philosophy"}
          </h2>
          <p className="text-sm sm:text-base">
            {content["about.philosophy.content"] || "We believe in minimalism without compromise. Clean lines, bold fits, and timeless colorways that never go out of style. No excessive branding, no unnecessary details— just pure, refined streetwear."}
          </p>

          <h2 className="mt-8 font-heading text-2xl font-bold sm:mt-12 sm:text-3xl">
            {content["about.sustainability.title"] || "Sustainability"}
          </h2>
          <p className="text-sm sm:text-base">
            {content["about.sustainability.content"] || "Quality over quantity. By creating hoodies built to last years instead of seasons, we're doing our part to reduce fast fashion waste. Every piece is made to withstand the test of time—both in durability and style."}
          </p>

          <div className="mt-8 rounded-xl bg-brand-peach/20 p-6 text-center sm:mt-12 sm:rounded-2xl sm:p-8">
            <p className="font-heading text-xl font-bold sm:text-2xl">
              {content["about.tagline"] || "Built to live in."}
            </p>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              {content["about.taglineSubtext"] || "That's not just a tagline—it's a promise."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
