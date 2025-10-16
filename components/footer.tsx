import Link from "next/link";
import { Instagram, Facebook, Twitter } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <h3 className="font-heading text-2xl font-bold">WEZZA</h3>
            <p className="mt-4 text-sm text-muted-foreground">
              Built to live in. Premium streetwear hoodies crafted for comfort and style.
            </p>
          </div>

          <div>
            <h4 className="font-heading text-lg font-semibold">Shop</h4>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/shop" className="text-sm text-muted-foreground hover:text-foreground">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/shop?collection=Core" className="text-sm text-muted-foreground hover:text-foreground">
                  Core Collection
                </Link>
              </li>
              <li>
                <Link href="/shop?collection=Lunar" className="text-sm text-muted-foreground hover:text-foreground">
                  Lunar Collection
                </Link>
              </li>
              <li>
                <Link href="/custom" className="text-sm text-muted-foreground hover:text-foreground">
                  Custom Orders
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-lg font-semibold">Support</h4>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/contact#faq" className="text-sm text-muted-foreground hover:text-foreground">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact#shipping" className="text-sm text-muted-foreground hover:text-foreground">
                  Shipping
                </Link>
              </li>
              <li>
                <Link href="/contact#returns" className="text-sm text-muted-foreground hover:text-foreground">
                  Returns
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-lg font-semibold">Follow Us</h4>
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
          <p>&copy; {currentYear} WEZZA. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
