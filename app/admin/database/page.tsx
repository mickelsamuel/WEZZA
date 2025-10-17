"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, ExternalLink, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";

export default function DatabasePage() {
  const [loading, setLoading] = useState(false);
  const [studioUrl, setStudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const openPrismaStudio = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/database/studio", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to start Prisma Studio");
      }

      setStudioUrl(data.url);

      // Open in new tab
      window.open(data.url, "_blank");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin">
          <Button variant="ghost" size="icon">
            <span className="sr-only">Back</span>
            ←
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Database Manager</h1>
          <p className="text-gray-600 mt-1">
            View and manage your entire database
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Prisma Studio
          </CardTitle>
          <CardDescription>
            Visual database browser to view and edit all tables
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">What is Prisma Studio?</h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Visual interface to browse all database tables</li>
              <li>View, edit, create, and delete records</li>
              <li>See relationships between tables</li>
              <li>Filter and search data easily</li>
              <li>No SQL knowledge required</li>
            </ul>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-900">Error</h4>
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {studioUrl && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                <h4 className="font-semibold text-green-900">Prisma Studio is running</h4>
              </div>
              <p className="text-sm text-green-800 mb-3">
                Prisma Studio has been opened in a new tab at: {studioUrl}
              </p>
              <a
                href={studioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-green-700 hover:text-green-900 font-medium"
              >
                Open again <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          )}

          <Button
            onClick={openPrismaStudio}
            disabled={loading}
            size="lg"
            className="w-full bg-brand-orange hover:bg-brand-orange/90"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Starting Prisma Studio...
              </>
            ) : (
              <>
                <Database className="h-5 w-5 mr-2" />
                Open Database Manager
              </>
            )}
          </Button>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-900 mb-1">⚠️ Production Warning</h4>
                <p className="text-sm text-yellow-800">
                  Be careful when editing data in production! Changes are permanent and cannot be undone.
                  Always backup your data before making bulk changes.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Database Tables</CardTitle>
          <CardDescription>Quick overview of your database structure</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "Products", description: "All product listings", icon: "🛍️" },
              { name: "Collections", description: "Product collections", icon: "📁" },
              { name: "Orders", description: "Customer orders", icon: "📦" },
              { name: "Users", description: "Customer accounts", icon: "👥" },
              { name: "Inventory", description: "Stock levels", icon: "📊" },
              { name: "Reviews", description: "Product reviews", icon: "⭐" },
              { name: "Wishlist", description: "Saved products", icon: "❤️" },
              { name: "Cart", description: "Shopping carts", icon: "🛒" },
              { name: "Addresses", description: "Saved addresses", icon: "📍" },
              { name: "EmailLog", description: "Email history", icon: "📧" },
              { name: "StockNotification", description: "Waitlist", icon: "🔔" },
              { name: "SearchHistory", description: "Search analytics", icon: "🔍" },
            ].map((table) => (
              <div
                key={table.name}
                className="border rounded-lg p-4 hover:border-brand-orange transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{table.icon}</span>
                  <h3 className="font-semibold">{table.name}</h3>
                </div>
                <p className="text-sm text-gray-600">{table.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
