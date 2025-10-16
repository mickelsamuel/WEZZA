import { requireAdmin } from "@/lib/admin-auth";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard - WEZZA",
  description: "Manage products, orders, and customers",
  robots: "noindex, nofollow",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: "📊" },
    { href: "/admin/products", label: "Products", icon: "👕" },
    { href: "/admin/orders", label: "Orders", icon: "📦" },
    { href: "/admin/customers", label: "Customers", icon: "👥" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-black text-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-xl font-bold">
                WEZZA
              </Link>
              <span className="text-sm text-gray-400">/ Admin</span>
            </div>
            <Link
              href="/"
              className="text-sm hover:text-brand-orange transition-colors"
            >
              Back to Store
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Main Content */}
        <main className="w-full">{children}</main>
      </div>
    </div>
  );
}
