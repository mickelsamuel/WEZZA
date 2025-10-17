# WEZZA Store

A modern, full-featured e-commerce platform for premium streetwear hoodies built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- **Modern Stack**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Shopping Cart**: Zustand state management with localStorage persistence
- **Stripe Checkout**: Secure payment processing with Stripe
- **Custom Orders**: Email-based custom hoodie order form using Resend
- **Product Management**: JSON-based product data with filtering and sorting
- **Responsive Design**: Mobile-first, fully responsive UI
- **SEO Optimized**: Metadata, sitemap, and OpenGraph tags
- **Type-Safe**: Fully typed with TypeScript
- **Accessible**: Built with Radix UI primitives

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Stripe account (for checkout)
- Resend account (for custom order emails)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd WEZZA
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your API keys:
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=wezza28711@gmail.com
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

4. Add product images:
Place product images in `/public/images/products/` following the naming convention in the `.gitkeep` file.

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the store.

## Project Structure

```
.
├── app/                    # Next.js 14 App Router
│   ├── (store)/           # Store pages with shared layout
│   ├── api/               # API routes (checkout, contact)
│   └── sitemap.ts         # Dynamic sitemap
├── components/            # React components
│   └── ui/               # shadcn/ui components
├── lib/                   # Utilities and helpers
│   ├── products.ts       # Product data access layer
│   ├── stripe.ts         # Stripe configuration
│   └── email.ts          # Resend email configuration
├── store/                 # Zustand stores
│   └── cart.ts           # Shopping cart state
├── data/                  # Product data (JSON)
└── public/               # Static assets
```

## Key Pages

- **Home** (`/`): Hero section, featured products, value props, Instagram strip
- **Shop** (`/shop`): Product grid with filters (color, size, collection) and sorting
- **Product** (`/product/[slug]`): Product details, image gallery, add to cart
- **Cart** (`/cart`): Shopping cart with quantity controls and checkout
- **Custom Orders** (`/custom`): Form for custom hoodie requests
- **About** (`/about`): Brand story and values
- **Contact** (`/contact`): FAQ and contact information
- **Checkout Success/Cancel**: Post-checkout pages

## Product Management

Products are stored in `/data/products.json`. To add or modify products:

1. Edit `products.json` with the new product data
2. Add corresponding images to `/public/images/products/`
3. Images follow the pattern: `{slug}-{number}.jpg`

## Stripe Checkout

The checkout flow:
1. User adds items to cart (stored in localStorage via Zustand)
2. User clicks "Checkout" on cart page
3. POST request to `/api/checkout` creates Stripe Checkout Session
4. User redirects to Stripe-hosted checkout
5. On success: redirect to `/checkout/success`, cart is cleared
6. On cancel: redirect to `/checkout/cancel`, cart is preserved

## Custom Orders

Custom orders use Resend to send emails:
1. User fills out form at `/custom`
2. POST request to `/api/contact` sends email with order details
3. Store owner receives email with customer info and design notes

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

Ensure Node.js runtime is available for API routes (`app/api/*`). Set `runtime = "nodejs"` in route handlers.

## Customization

### Brand Colors

Edit colors in `tailwind.config.ts`:
```typescript
brand: {
  black: "#000000",
  white: "#FFFFFF",
  orange: "#E37025",
  peach: "#FAD4C0",
  gray: "#DCDCDC",
}
```

### Typography

Fonts are loaded in `app/layout.tsx` using `next/font/google`. Current fonts:
- Headings: Bebas Neue
- Body: Inter

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
npm run format   # Format code with Prettier
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui (Radix UI primitives)
- **State Management**: Zustand
- **Payments**: Stripe Checkout
- **Email**: Resend
- **Icons**: Lucide React

## License

Proprietary - All rights reserved

## Support

For questions or issues, contact: wezza28711@gmail.com
