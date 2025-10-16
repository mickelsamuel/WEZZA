import Link from "next/link";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

export default function CheckoutCancelPage() {
  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <XCircle className="mx-auto h-24 w-24 text-muted-foreground" />
      <h1 className="mt-6 font-heading text-4xl font-bold md:text-5xl">Checkout Cancelled</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Your order was not completed. Your cart has been saved.
      </p>
      <p className="mt-2 text-muted-foreground">
        Feel free to continue shopping or return to your cart when you're ready.
      </p>
      <div className="mt-8 space-x-4">
        <Link href="/cart">
          <Button size="lg">Return to Cart</Button>
        </Link>
        <Link href="/shop">
          <Button size="lg" variant="outline">
            Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  );
}
