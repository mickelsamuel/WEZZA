import Link from "next/link";
import { Instagram } from "lucide-react";
import { getContentBySection } from "@/lib/site-content";

export async function Footer() {
  const currentYear = new Date().getFullYear();
  const content = await getContentBySection("footer");

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-4">
          <div>
            <h3 className="font-heading text-xl font-bold sm:text-2xl">
              {content["footer.brandName"] || "WEZZA"}
            </h3>
            <p className="mt-3 text-xs text-muted-foreground sm:mt-4 sm:text-sm">
              {content["footer.brandTagline"] || "Built to live in. Premium streetwear hoodies crafted for comfort and style."}
            </p>
          </div>

          <div>
            <h4 className="font-heading text-base font-semibold sm:text-lg">
              {content["footer.shop.title"] || "Shop"}
            </h4>
            <ul className="mt-3 space-y-1.5 sm:mt-4 sm:space-y-2">
              <li>
                <Link href="/shop" className="text-xs text-muted-foreground hover:text-foreground sm:text-sm">
                  {content["footer.shop.allProducts"] || "All Products"}
                </Link>
              </li>
              <li>
                <Link href="/shop?collection=Core" className="text-xs text-muted-foreground hover:text-foreground sm:text-sm">
                  {content["footer.shop.core"] || "Core Collection"}
                </Link>
              </li>
              <li>
                <Link href="/shop?collection=Lunar" className="text-xs text-muted-foreground hover:text-foreground sm:text-sm">
                  {content["footer.shop.lunar"] || "Lunar Collection"}
                </Link>
              </li>
              <li>
                <Link href="/custom" className="text-xs text-muted-foreground hover:text-foreground sm:text-sm">
                  {content["footer.shop.custom"] || "Custom Orders"}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-base font-semibold sm:text-lg">
              {content["footer.support.title"] || "Support"}
            </h4>
            <ul className="mt-3 space-y-1.5 sm:mt-4 sm:space-y-2">
              <li>
                <Link href="/contact" className="text-xs text-muted-foreground hover:text-foreground sm:text-sm">
                  {content["footer.support.contact"] || "Contact Us"}
                </Link>
              </li>
              <li>
                <Link href="/contact#faq" className="text-xs text-muted-foreground hover:text-foreground sm:text-sm">
                  {content["footer.support.faq"] || "FAQ"}
                </Link>
              </li>
              <li>
                <Link href="/contact#shipping" className="text-xs text-muted-foreground hover:text-foreground sm:text-sm">
                  {content["footer.support.shipping"] || "Shipping"}
                </Link>
              </li>
              <li>
                <Link href="/contact#returns" className="text-xs text-muted-foreground hover:text-foreground sm:text-sm">
                  {content["footer.support.returns"] || "Returns"}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-base font-semibold sm:text-lg">
              {content["footer.social.title"] || "Follow Us"}
            </h4>
            <div className="mt-3 flex gap-4 sm:mt-4">
              <a
                href="https://www.instagram.com/wezza_ca?utm_source=ig_web_button_share_sheet&igsh=MTN5d3E5NHB1Mjc2Yw=="
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-brand-orange"
              >
                <Instagram className="h-5 w-5 sm:h-6 sm:w-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t pt-6 text-center text-xs text-muted-foreground sm:mt-12 sm:pt-8 sm:text-sm">
          <p>&copy; {currentYear} {content["footer.copyright"] || "WEZZA. All rights reserved."}</p>
        </div>
      </div>
    </footer>
  );
}
