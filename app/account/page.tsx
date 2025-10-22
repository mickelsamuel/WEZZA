"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowRight, Package, ShoppingBag, User, LogOut, Calendar, MapPin, Plus, Edit, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [content, setContent] = useState<Record<string, string>>({});
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [addressForm, setAddressForm] = useState({
    name: "",
    street: "",
    city: "",
    province: "",
    postalCode: "",
    country: "Canada",
    isDefault: false,
  });

  useEffect(() => {
    fetch("/api/site-content?section=account")
      .then((res) => res.json())
      .then((data) => {
        const contentMap: Record<string, string> = {};
        data.content?.forEach((item: any) => {
          contentMap[item.key] = item.value;
        });
        setContent(contentMap);
      })
      .catch((error) => {
        console.error("Error fetching content:", error);
      });
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    } else if (status === "authenticated") {
      fetchOrders();
      fetchAddresses();
    }
  }, [status, router]);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders");
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      const response = await fetch("/api/addresses");
      if (response.ok) {
        const data = await response.json();
        setAddresses(data);
      }
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
    }
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      const response = await fetch("/api/account/delete", {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete account");
      }

      toast.success("Account deleted successfully");

      // Sign out and redirect to home
      await signOut({ callbackUrl: "/" });
    } catch (error: any) {
      toast.error(error.message || "Failed to delete account");
      setIsDeletingAccount(false);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingAddress ? `/api/addresses/${editingAddress.id}` : "/api/addresses";
      const method = editingAddress ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addressForm),
      });

      if (!response.ok) {
        throw new Error("Failed to save address");
      }

      toast.success(editingAddress ? (content["account.addresses.updated"] || "Address updated!") : (content["account.addresses.added"] || "Address added!"));
      setShowAddressForm(false);
      setEditingAddress(null);
      setAddressForm({
        name: "",
        street: "",
        city: "",
        province: "",
        postalCode: "",
        country: "Canada",
        isDefault: false,
      });
      fetchAddresses();
    } catch (error) {
      toast.error(content["account.addresses.error"] || "Failed to save address");
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm(content["account.addresses.deleteConfirm"] || "Are you sure you want to delete this address?")) {
      return;
    }

    try {
      const response = await fetch(`/api/addresses/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete address");
      }

      toast.success(content["account.addresses.deleted"] || "Address deleted!");
      fetchAddresses();
    } catch (error) {
      toast.error(content["account.addresses.deleteError"] || "Failed to delete address");
    }
  };

  const handleEditAddress = (address: Address) => {
    setAddressForm({
      name: address.name,
      street: address.street,
      city: address.city,
      province: address.province,
      postalCode: address.postalCode,
      country: address.country,
      isDefault: address.isDefault,
    });
    setEditingAddress(address);
    setShowAddressForm(true);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-black via-brand-black to-brand-orange">
        <div className="text-white text-xl">{content["account.loading"] || "Loading..."}</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-black via-brand-black to-brand-orange">
      <div className="container mx-auto px-4 py-12">
        {/* Back to Store */}
        <Link href="/" className="inline-flex items-center text-white/70 hover:text-white transition-colors mb-8">
          <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
          {content["account.backToStore"] || "Back to Store"}
        </Link>

        {/* Header */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="font-heading text-5xl md:text-6xl font-bold text-white mb-2">
                {content["account.heading"] || "MY ACCOUNT"}
              </h1>
              <p className="text-lg text-white/70">
                {content["account.welcome"] || "Welcome back"}, {session.user?.name || session.user?.email?.split("@")[0]}
              </p>
            </div>
            <Button
              variant="outline"
              size="lg"
              onClick={handleSignOut}
              className="border-2 border-white/30 bg-white/10 backdrop-blur-lg text-white hover:bg-red-500 hover:border-red-500 hover:text-white transition-all"
            >
              <LogOut className="mr-2 h-5 w-5" />
              {content["account.signOut"] || "Sign Out"}
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-brand-orange/20 rounded-xl">
                <Package className="h-8 w-8 text-brand-orange" />
              </div>
              <div>
                <p className="text-white/60 text-sm font-medium">{content["account.stats.orders"] || "Total Orders"}</p>
                <p className="text-3xl font-bold text-white">{orders.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <MapPin className="h-8 w-8 text-blue-400" />
              </div>
              <div>
                <p className="text-white/60 text-sm font-medium">{content["account.stats.addresses"] || "Saved Addresses"}</p>
                <p className="text-3xl font-bold text-white">{addresses.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <ShoppingBag className="h-8 w-8 text-green-400" />
              </div>
              <div>
                <p className="text-white/60 text-sm font-medium">{content["account.stats.status"] || "Account Status"}</p>
                <p className="text-2xl font-bold text-green-400">{content["account.stats.active"] || "Active"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Details */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <User className="h-6 w-6 text-brand-orange" />
            <h2 className="text-2xl font-bold text-white">{content["account.details.heading"] || "Account Details"}</h2>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-white/60 text-sm mb-1">{content["account.details.email"] || "Email"}</p>
              <p className="text-white text-lg">{session.user?.email}</p>
            </div>
            {session.user?.name && (
              <div>
                <p className="text-white/60 text-sm mb-1">{content["account.details.name"] || "Name"}</p>
                <p className="text-white text-lg">{session.user.name}</p>
              </div>
            )}
          </div>
        </div>

        {/* Saved Addresses */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <MapPin className="h-6 w-6 text-brand-orange" />
              <h2 className="text-2xl font-bold text-white">{content["account.addresses.heading"] || "Saved Addresses"}</h2>
            </div>
            <Button
              onClick={() => {
                setEditingAddress(null);
                setAddressForm({
                  name: "",
                  street: "",
                  city: "",
                  province: "",
                  postalCode: "",
                  country: "Canada",
                  isDefault: false,
                });
                setShowAddressForm(!showAddressForm);
              }}
              className="bg-brand-orange hover:bg-brand-orange/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              {content["account.addresses.add"] || "Add Address"}
            </Button>
          </div>

          {showAddressForm && (
            <form onSubmit={handleSaveAddress} className="bg-white/5 rounded-xl p-6 mb-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">
                {editingAddress ? (content["account.addresses.edit"] || "Edit Address") : (content["account.addresses.new"] || "New Address")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">{content["account.addresses.name.label"] || "Address Name *"}</Label>
                  <Input
                    value={addressForm.name}
                    onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                    placeholder={content["account.addresses.name.placeholder"] || "e.g., Home, Work"}
                    required
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white">{content["account.addresses.street.label"] || "Street Address *"}</Label>
                  <Input
                    value={addressForm.street}
                    onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                    placeholder={content["account.addresses.street.placeholder"] || "123 Main St"}
                    required
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white">{content["account.addresses.city.label"] || "City *"}</Label>
                  <Input
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    placeholder={content["account.addresses.city.placeholder"] || "Toronto"}
                    required
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white">{content["account.addresses.province.label"] || "Province *"}</Label>
                  <Input
                    value={addressForm.province}
                    onChange={(e) => setAddressForm({ ...addressForm, province: e.target.value })}
                    placeholder={content["account.addresses.province.placeholder"] || "ON"}
                    required
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white">{content["account.addresses.postal.label"] || "Postal Code *"}</Label>
                  <Input
                    value={addressForm.postalCode}
                    onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                    placeholder={content["account.addresses.postal.placeholder"] || "A1A 1A1"}
                    required
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white">{content["account.addresses.country.label"] || "Country *"}</Label>
                  <Input
                    value={addressForm.country}
                    onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                    required
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="isDefault" className="text-white">{content["account.addresses.default"] || "Set as default address"}</Label>
              </div>
              <div className="flex gap-4 mt-6">
                <Button type="submit" className="bg-brand-orange hover:bg-brand-orange/90">
                  {editingAddress ? (content["account.addresses.update"] || "Update Address") : (content["account.addresses.save"] || "Save Address")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddressForm(false);
                    setEditingAddress(null);
                  }}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  {content["account.addresses.cancel"] || "Cancel"}
                </Button>
              </div>
            </form>
          )}

          {addresses.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="h-16 w-16 text-white/30 mx-auto mb-4" />
              <p className="text-white/60 mb-6">{content["account.addresses.empty"] || "No saved addresses yet"}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className="border border-white/20 rounded-xl p-6 hover:border-brand-orange transition-all relative"
                >
                  {address.isDefault && (
                    <span className="absolute top-4 right-4 bg-brand-orange text-white text-xs px-2 py-1 rounded">
                      {content["account.addresses.defaultBadge"] || "Default"}
                    </span>
                  )}
                  <p className="text-white font-semibold text-lg mb-2">{address.name}</p>
                  <p className="text-white/80 text-sm">{address.street}</p>
                  <p className="text-white/80 text-sm">
                    {address.city}, {address.province} {address.postalCode}
                  </p>
                  <p className="text-white/80 text-sm">{address.country}</p>
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditAddress(address)}
                      className="border-brand-orange/50 text-brand-orange hover:bg-brand-orange/10 hover:border-brand-orange"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      {content["account.addresses.editButton"] || "Edit"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteAddress(address.id)}
                      className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      {content["account.addresses.deleteButton"] || "Delete"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order History */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8">
          <div className="flex items-center gap-3 mb-6">
            <Package className="h-6 w-6 text-brand-orange" />
            <h2 className="text-2xl font-bold text-white">{content["account.orders.heading"] || "Order History"}</h2>
          </div>

          {isLoading ? (
            <p className="text-white/60 text-center py-8">{content["account.orders.loading"] || "Loading orders..."}</p>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="h-16 w-16 text-white/30 mx-auto mb-4" />
              <p className="text-white/60 mb-6 text-lg">{content["account.orders.empty"] || "You haven't placed any orders yet"}</p>
              <Link href="/shop">
                <Button size="lg" className="bg-brand-orange hover:bg-brand-orange/90">
                  {content["account.orders.startShopping"] || "Start Shopping"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Link key={order.id} href={`/orders/${order.orderNumber}`}>
                  <div className="border border-white/20 rounded-xl p-6 hover:border-brand-orange hover:bg-white/5 transition-all cursor-pointer">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="text-white font-semibold text-lg">
                            Order #{order.orderNumber}
                          </p>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              order.status === "completed"
                                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                : order.status === "processing"
                                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                : order.status === "cancelled"
                                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                            }`}
                          >
                            {order.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-white/60">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Package className="h-4 w-4" />
                            {Array.isArray(order.items) ? order.items.length : 0} {content["account.orders.items"] || "items"}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-white">
                          ${(order.total / 100).toFixed(2)}
                        </p>
                        <p className="text-sm text-white/60">{order.currency}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Danger Zone - Delete Account */}
        <div className="bg-red-500/10 backdrop-blur-lg rounded-2xl border border-red-500/30 p-8">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-400" />
            <h2 className="text-2xl font-bold text-white">Danger Zone</h2>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-white/80 text-sm mb-4">
                Once you delete your account, there is no going back. This action will permanently delete:
              </p>
              <ul className="text-white/60 text-sm space-y-2 ml-6 list-disc">
                <li>Your account information and profile</li>
                <li>All order history and purchase records</li>
                <li>Saved addresses and payment methods</li>
                <li>Wishlist and cart items</li>
                <li>Product reviews and ratings</li>
              </ul>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700 text-white"
                  disabled={isDeletingAccount}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isDeletingAccount ? "Deleting..." : "Delete My Account"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-gray-900 border-red-500/30">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white text-xl">
                    Are you absolutely sure?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-white/70">
                    <span className="block mb-4">
                      This action cannot be undone. This will permanently delete your account
                      and remove all your data from our servers, including:
                    </span>
                    <ul className="space-y-2 list-disc ml-6">
                      <li>All order history ({orders.length} orders)</li>
                      <li>Saved addresses ({addresses.length} addresses)</li>
                      <li>Payment methods and preferences</li>
                      <li>Reviews, ratings, and wishlist</li>
                    </ul>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-red-600 hover:bg-red-700 text-white"
                    disabled={isDeletingAccount}
                  >
                    {isDeletingAccount ? "Deleting..." : "Yes, delete my account"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
}
