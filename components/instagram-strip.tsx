import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getContentBySection } from "@/lib/site-content";

// Default fallback images if none are set in admin
const DEFAULT_IMAGES = [
  { id: 1, src: "/images/instagram/1.jpg", alt: "WEZZA on Instagram" },
  { id: 2, src: "/images/instagram/2.jpg", alt: "WEZZA on Instagram" },
  { id: 3, src: "/images/instagram/3.jpg", alt: "WEZZA on Instagram" },
  { id: 4, src: "/images/instagram/4.jpg", alt: "WEZZA on Instagram" },
  { id: 5, src: "/images/instagram/5.jpg", alt: "WEZZA on Instagram" },
  { id: 6, src: "/images/instagram/6.jpg", alt: "WEZZA on Instagram" },
];

async function getInstagramImages() {
  try {
    const gallery = await prisma.siteImage.findUnique({
      where: { key: "instagram-gallery" },
    });

    if (!gallery) {
      return DEFAULT_IMAGES;
    }

    // Parse images from JSON
    const images: string[] = JSON.parse(gallery.url);

    // Filter out empty strings and map to proper format
    const validImages = images
      .filter((img) => img && img.trim() !== "")
      .map((img, index) => ({
        id: index + 1,
        src: img,
        alt: "WEZZA on Instagram",
      }));

    // If no valid images, return defaults
    return validImages.length > 0 ? validImages : DEFAULT_IMAGES;
  } catch (error) {
    console.error("Error loading Instagram gallery:", error);
    return DEFAULT_IMAGES;
  }
}

export async function InstagramStrip() {
  const images = await getInstagramImages();
  const content = await getContentBySection("home");

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h2 className="font-heading text-3xl font-bold md:text-4xl">
            {content["home.instagram.title"] || "Follow @WEZZA"}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {content["home.instagram.description"] || "See how our community styles their hoodies"}
          </p>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {images.map((image) => (
            <a
              key={image.id}
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden rounded-lg"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover transition-transform group-hover:scale-110"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
              />
              <div className="absolute inset-0 bg-black/0 transition-all group-hover:bg-black/30" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
