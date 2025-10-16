export interface Product {
  slug: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  sizes: string[];
  colors: string[];
  collection: "Core" | "Lunar" | "Customizable";
  images: string[];
  featured: boolean;
  inStock: boolean;
  tags: string[];
  fabric: string;
  care: string;
  shipping: string;
  stockBySize?: Record<string, number>; // Optional stock tracking per size
  totalStock?: number; // Optional total stock count
}

export interface CartItem {
  product: Product;
  size: string;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  addItem: (product: Product, size: string, quantity: number) => void;
  removeItem: (productSlug: string, size: string) => void;
  updateQuantity: (productSlug: string, size: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export interface CustomOrderFormData {
  name: string;
  email: string;
  hoodieColor: string;
  size: string;
  designNotes: string;
  imageUrl?: string;
}
