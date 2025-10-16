import { formatPrice } from "@/lib/currency";

interface PriceProps {
  price: number;
  currency?: string;
  className?: string;
}

export function Price({ price, currency = "CAD", className }: PriceProps) {
  return <span className={className}>{formatPrice(price, currency)}</span>;
}
