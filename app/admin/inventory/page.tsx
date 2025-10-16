"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {  AlertTriangle, Package, Plus, Minus, Edit, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface InventoryItem {
  id: string;
  productSlug: string;
  sizeQuantities: Record<string, number>;
  lowStockThreshold: number;
  totalStock: number;
  hasLowStock: boolean;
  product: {
    id: string;
    slug: string;
    title: string;
    images: string[];
    collection: {
      name: string;
    } | null;
  } | null;
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [adjustmentSize, setAdjustmentSize] = useState<string>("");
  const [adjustmentQty, setAdjustmentQty] = useState<number>(0);
  const [adjustmentReason, setAdjustmentReason] = useState<string>("");

  const fetchInventory = async () => {
    try {
      const response = await fetch("/api/admin/inventory");
      if (response.ok) {
        const data = await response.json();
        setInventory(data);
      }
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAdjustment = async (item: InventoryItem, size: string, adjustment: number) => {
    try {
      const response = await fetch(`/api/admin/inventory/${item.productSlug}/adjust`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          size,
          adjustment,
          reason: adjustmentReason || "Manual adjustment",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      toast.success(`Inventory adjusted for ${item.product?.title} (${size})`);
      fetchInventory();
      setAdjustmentSize("");
      setAdjustmentQty(0);
      setAdjustmentReason("");
    } catch (error: any) {
      toast.error(error.message || "Failed to adjust inventory");
    }
  };

  const handleUpdateThreshold = async (item: InventoryItem, newThreshold: number) => {
    try {
      const response = await fetch(`/api/admin/inventory/${item.productSlug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lowStockThreshold: newThreshold,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      toast.success("Low stock threshold updated");
      fetchInventory();
    } catch (error: any) {
      toast.error(error.message || "Failed to update threshold");
    }
  };

  const lowStockItems = inventory.filter((item) => item.hasLowStock);
  const outOfStockItems = inventory.filter((item) => item.totalStock === 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-gray-600 mt-1">Monitor and manage product stock levels</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventory.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lowStockItems.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{outOfStockItems.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alerts
            </CardTitle>
            <CardDescription>These products are running low on inventory</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div className="flex items-center gap-3">
                    {item.product?.images[0] && (
                      <div className="relative h-12 w-12 rounded overflow-hidden">
                        <Image src={item.product.images[0]} alt="" fill className="object-cover" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{item.product?.title}</p>
                      <p className="text-sm text-gray-600">Total: {item.totalStock} items</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedItem(item);
                      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
                    }}
                  >
                    Adjust Stock
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Inventory</CardTitle>
          <CardDescription>Manage stock quantities for all products and sizes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {inventory.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {item.product?.images[0] && (
                      <div className="relative h-20 w-20 rounded overflow-hidden flex-shrink-0">
                        <Image src={item.product.images[0]} alt="" fill className="object-cover" />
                      </div>
                    )}

                    <div className="flex-1 space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg">{item.product?.title}</h3>
                        <p className="text-sm text-gray-600">
                          {item.product?.collection?.name} • {item.productSlug}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Total Stock: <span className="font-medium">{item.totalStock}</span> •
                          Low Stock Threshold: <span className="font-medium">{item.lowStockThreshold}</span>
                        </p>
                      </div>

                      <div className="grid grid-cols-5 gap-3">
                        {Object.entries(item.sizeQuantities as Record<string, number>).map(([size, qty]) => {
                          const isLow = qty <= item.lowStockThreshold;
                          const isOut = qty === 0;
                          return (
                            <div
                              key={size}
                              className={`p-3 rounded-lg border-2 ${
                                isOut
                                  ? "border-red-200 bg-red-50"
                                  : isLow
                                  ? "border-yellow-200 bg-yellow-50"
                                  : "border-gray-200"
                              }`}
                            >
                              <div className="text-center">
                                <p className="font-semibold text-lg">{size}</p>
                                <p className={`text-2xl font-bold ${isOut ? "text-red-600" : isLow ? "text-yellow-600" : ""}`}>
                                  {qty}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedItem(item);
                            setAdjustmentSize(Object.keys(item.sizeQuantities)[0]);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Adjust Stock
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Adjustment Form */}
      {selectedItem && (
        <Card className="border-brand-orange">
          <CardHeader>
            <CardTitle>Adjust Inventory: {selectedItem.product?.title}</CardTitle>
            <CardDescription>Add or remove stock quantities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Size</Label>
                  <select
                    value={adjustmentSize}
                    onChange={(e) => setAdjustmentSize(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2"
                  >
                    {Object.keys(selectedItem.sizeQuantities).map((size) => (
                      <option key={size} value={size}>
                        {size} (Current: {selectedItem.sizeQuantities[size]})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Adjustment</Label>
                  <Input
                    type="number"
                    value={adjustmentQty}
                    onChange={(e) => setAdjustmentQty(parseInt(e.target.value) || 0)}
                    placeholder="e.g., 10 or -5"
                  />
                  <p className="text-xs text-gray-500">Positive to add, negative to subtract</p>
                </div>

                <div className="space-y-2">
                  <Label>Reason (optional)</Label>
                  <Input
                    value={adjustmentReason}
                    onChange={(e) => setAdjustmentReason(e.target.value)}
                    placeholder="e.g., Restock, Damaged"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    if (adjustmentSize && adjustmentQty !== 0) {
                      handleAdjustment(selectedItem, adjustmentSize, adjustmentQty);
                    }
                  }}
                  disabled={!adjustmentSize || adjustmentQty === 0}
                >
                  {adjustmentQty > 0 ? <Plus className="h-4 w-4 mr-1" /> : <Minus className="h-4 w-4 mr-1" />}
                  Apply Adjustment
                </Button>
                <Button variant="outline" onClick={() => setSelectedItem(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
