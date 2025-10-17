import Link from "next/link";
import { Instagram, Facebook, Twitter } from "lucide-react";
import { getContentBySection } from "@/lib/site-content";

export async function Footer() {
  const currentYear = new Date().getFullYear();
  const content = await getContentBySection("footer");

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <h3 className="font-heading text-2xl font-bold">
              {content["footer.brandName"] || "WEZZA"}
            </h3>
            <p className="mt-4 text-sm text-muted-foreground">
              {content["footer.brandTagline"] || "Built to live in. Premium streetwear hoodies crafted for comfort and style."}
            </p>
          </div>

          <div>
            <h4 className="font-heading text-lg font-semibold">
              {content["footer.shop.title"] || "Shop"}
            </h4>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/shop" className="text-sm text-muted-foreground hover:text-foreground">
                  {content["footer.shop.allProducts"] || "All Products"}
                </Link>
              </li>
              <li>
                <Link href="/shop?collection=Core" className="text-sm text-muted-foreground hover:text-foreground">
                  {content["footer.shop.core"] || "Core Collection"}
                </Link>
              </li>
              <li>
                <Link href="/shop?collection=Lunar" className="text-sm text-muted-foreground hover:text-foreground">
                  {content["footer.shop.lunar"] || "Lunar Collection"}
                </Link>
              </li>
              <li>
                <Link href="/custom" className="text-sm text-muted-foreground hover:text-foreground">
                  {content["footer.shop.custom"] || "Custom Orders"}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-lg font-semibold">
              {content["footer.support.title"] || "Support"}
            </h4>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">
                  {content["footer.support.contact"] || "Contact Us"}
                </Link>
              </li>
              <li>
                <Link href="/contact#faq" className="text-sm text-muted-foreground hover:text-foreground">
                  {content["footer.support.faq"] || "FAQ"}
                </Link>
              </li>
              <li>
                <Link href="/contact#shipping" className="text-sm text-muted-foreground hover:text-foreground">
                  {content["footer.support.shipping"] || "Shipping"}
                </Link>
              </li>
              <li>
                <Link href="/contact#returns" className="text-sm text-muted-foreground hover:text-foreground">
                  {content["footer.support.returns"] || "Returns"}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-lg font-semibold">
              {content["footer.social.title"] || "Follow Us"}
            </h4>
            <div className="mt-4 flex gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-brand-orange"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-brand-orange"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-brand-orange"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {currentYear} {content["footer.copyright"] || "WEZZA. All rights reserved."}</p>
        </div>
      </div>
    </footer>
  );
}
