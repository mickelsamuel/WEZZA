import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/currency";
import Link from "next/link";
import { Package, FolderOpen, BarChart3, Users, ShoppingCart, Image, Star, FileText, UserCog } from "lucide-react";

async function getDashboardStats() {
  const [
    totalOrders,
    totalRevenue,
    totalCustomers,
    pendingOrders,
    recentOrders,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { not: "cancelled" } },
    }),
    prisma.user.count({ where: { role: "customer" } }),
    prisma.order.count({ where: { status: "pending" } }),
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } } },
    }),
  ]);

  return {
    totalOrders,
    totalRevenue: totalRevenue._sum.total || 0,
    totalCustomers,
    pendingOrders,
    recentOrders,
  };
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  const statCards = [
    {
      title: "Total Revenue",
      value: formatPrice(stats.totalRevenue, "CAD"),
      description: "All time revenue",
      icon: "💰",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.toString(),
      description: "All time orders",
      icon: "📦",
    },
    {
      title: "Customers",
      value: stats.totalCustomers.toString(),
      description: "Registered users",
      icon: "👥",
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders.toString(),
      description: "Awaiting processing",
      icon: "⏳",
    },
  ];

  const quickLinks = [
    {
      title: "Products",
      description: "Manage your product catalog",
      href: "/admin/products",
      icon: Package,
      color: "bg-blue-500",
    },
    {
      title: "Featured Products",
      description: "Choose homepage featured hoodies",
      href: "/admin/featured",
      icon: Star,
      color: "bg-yellow-500",
    },
    {
      title: "Collections",
      description: "Organize products into collections",
      href: "/admin/collections",
      icon: FolderOpen,
      color: "bg-purple-500",
    },
    {
      title: "Inventory",
      description: "Track and manage stock levels",
      href: "/admin/inventory",
      icon: BarChart3,
      color: "bg-green-500",
    },
    {
      title: "Orders",
      description: "View and manage orders",
      href: "/admin/orders",
      icon: ShoppingCart,
      color: "bg-orange-500",
    },
    {
      title: "Customers",
      description: "Manage customer accounts",
      href: "/admin/customers",
      icon: Users,
      color: "bg-pink-500",
    },
    {
      title: "Instagram Gallery",
      description: "Update homepage Instagram images",
      href: "/admin/instagram",
      icon: Image,
      color: "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500",
    },
    {
      title: "Site Content",
      description: "Edit all text content across the website",
      href: "/admin/site-content",
      icon: FileText,
      color: "bg-indigo-500",
    },
    {
      title: "User Management",
      description: "Manage user accounts and roles",
      href: "/admin/users",
      icon: UserCog,
      color: "bg-cyan-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome back! Manage your store from here
        </p>
      </div>

      {/* Quick Access Links */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`${link.color} p-3 rounded-lg text-white`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{link.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{link.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <span className="text-2xl">{stat.icon}</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Latest orders from your store</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.recentOrders.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No orders yet</p>
          ) : (
            <div className="space-y-4">
              {stats.recentOrders.map((order: any) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium">{order.customerName}</p>
                    <p className="text-sm text-gray-600">{order.customerEmail}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatPrice(order.total, order.currency)}
                    </p>
                    <p className="text-sm text-gray-600 capitalize">
                      {order.status}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
