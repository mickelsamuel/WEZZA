import type { Metadata } from "next";
import { Inter, Bebas_Neue } from "next/font/google";
import "@/styles/globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import SessionProvider from "@/components/providers/session-provider";
import { CartSync } from "@/components/cart-sync";
import { AuthModalProvider } from "@/contexts/auth-modal-context";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
});

export const metadata: Metadata = {
  title: "WEZZA - Premium Cotton Hoodies | Built to Live In",
  description:
    "Discover WEZZA's collection of premium heavyweight cotton hoodies. Minimalist streetwear designed for comfort and style. Free shipping on orders over $100 CAD.",
  keywords: ["hoodies", "streetwear", "premium cotton", "WEZZA", "custom hoodies"],
  authors: [{ name: "WEZZA" }],
  creator: "WEZZA",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_CA",
    url: "https://wezza.com",
    title: "WEZZA - Premium Cotton Hoodies",
    description: "Built to live in. Premium heavyweight cotton hoodies.",
    siteName: "WEZZA",
  },
  twitter: {
    card: "summary_large_image",
    title: "WEZZA - Premium Cotton Hoodies",
    description: "Built to live in. Premium heavyweight cotton hoodies.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${bebasNeue.variable}`} suppressHydrationWarning>
      <body className="font-body" suppressHydrationWarning>
        <SessionProvider>
          <AuthModalProvider>
            <CartSync />
            {children}
            <Toaster />
            <SonnerToaster position="top-center" richColors />
          </AuthModalProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
