export function formatPrice(priceInCents: number, currency: string = "CAD"): string {
  const price = priceInCents / 100;
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
  }).format(price);
}

export function formatPriceCompact(priceInCents: number, currency: string = "CAD"): string {
  const price = priceInCents / 100;
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}
