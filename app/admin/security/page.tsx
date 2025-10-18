import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, Activity, Lock, Eye, ArrowLeft } from "lucide-react";
import Link from "next/link";

async function getSecurityStats() {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    criticalEvents24h,
    warningEvents24h,
    totalEvents7d,
    failedLogins24h,
    lockedAccounts,
    recentCriticalEvents,
    eventsByAction,
  ] = await Promise.all([
    // Critical events in last 24 hours
    prisma.auditLog.count({
      where: {
        severity: "critical",
        createdAt: { gte: oneDayAgo },
      },
    }),
    // Warning events in last 24 hours
    prisma.auditLog.count({
      where: {
        severity: "warning",
        createdAt: { gte: oneDayAgo },
      },
    }),
    // Total events in last 7 days
    prisma.auditLog.count({
      where: {
        createdAt: { gte: oneWeekAgo },
      },
    }),
    // Failed login attempts in last 24 hours
    prisma.auditLog.count({
      where: {
        action: "login_failed",
        createdAt: { gte: oneDayAgo },
      },
    }),
    // Currently locked accounts
    prisma.user.count({
      where: {
        accountLockedUntil: {
          gt: now,
        },
      },
    }),
    // Recent critical events
    prisma.auditLog.findMany({
      where: {
        severity: { in: ["critical", "warning"] },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        action: true,
        userEmail: true,
        ipAddress: true,
        severity: true,
        createdAt: true,
        resource: true,
      },
    }),
    // Event breakdown by action (last 7 days)
    prisma.auditLog.groupBy({
      by: ["action"],
      where: {
        createdAt: { gte: oneWeekAgo },
      },
      _count: {
        action: true,
      },
      orderBy: {
        _count: {
          action: "desc",
        },
      },
      take: 10,
    }),
  ]);

  return {
    criticalEvents24h,
    warningEvents24h,
    totalEvents7d,
    failedLogins24h,
    lockedAccounts,
    recentCriticalEvents,
    eventsByAction,
  };
}

export default async function SecurityDashboard() {
  const stats = await getSecurityStats();

  const statCards = [
    {
      title: "Critical Events",
      value: stats.criticalEvents24h.toString(),
      description: "Last 24 hours",
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Warning Events",
      value: stats.warningEvents24h.toString(),
      description: "Last 24 hours",
      icon: Eye,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Failed Logins",
      value: stats.failedLogins24h.toString(),
      description: "Last 24 hours",
      icon: Lock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Locked Accounts",
      value: stats.lockedAccounts.toString(),
      description: "Currently locked",
      icon: Shield,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Security Monitoring</h1>
          </div>
          <p className="text-gray-600">
            Real-time security events and audit logs
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-gray-600">{stat.description}</p>
                </CardContent>
              </Card>
            );
          })}
      </div>

      {/* Recent Critical Events */}
      <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recent Security Events</CardTitle>
            <CardDescription>
              Critical and warning events from the audit log
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentCriticalEvents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No security events found. System is secure!
              </div>
            ) : (
              <div className="space-y-4">
                {stats.recentCriticalEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start justify-between border-b pb-4 last:border-0"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant={
                            event.severity === "critical"
                              ? "destructive"
                              : "default"
                          }
                        >
                          {event.severity}
                        </Badge>
                        <span className="font-medium text-sm">
                          {event.action.replace(/_/g, " ").toUpperCase()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        {event.userEmail && (
                          <div>User: {event.userEmail}</div>
                        )}
                        {event.ipAddress && (
                          <div>IP: {event.ipAddress}</div>
                        )}
                        {event.resource && (
                          <div>Resource: {event.resource}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 whitespace-nowrap ml-4">
                      {new Date(event.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
      </Card>

      {/* Event Breakdown */}
      <Card>
          <CardHeader>
            <CardTitle>Event Breakdown (Last 7 Days)</CardTitle>
            <CardDescription>
              Most common security and admin actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.eventsByAction.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No events recorded in the last 7 days
              </div>
            ) : (
              <div className="space-y-3">
                {stats.eventsByAction.map((event) => (
                  <div
                    key={event.action}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm font-medium">
                      {event.action.replace(/_/g, " ")}
                    </span>
                    <div className="flex items-center gap-4">
                      <div className="w-48 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${Math.min(
                              (event._count.action / stats.totalEvents7d) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold w-12 text-right">
                        {event._count.action}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
      </Card>

      {/* Security Recommendations */}
      <Card className="mt-8 border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-yellow-600" />
              Security Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 mt-0.5">•</span>
                <span>Monitor failed login attempts - multiple failures may indicate brute force attacks</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 mt-0.5">•</span>
                <span>Review critical events immediately - they may require action</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 mt-0.5">•</span>
                <span>Locked accounts expire automatically after 15 minutes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 mt-0.5">•</span>
                <span>Enable 2FA for all admin accounts for enhanced security</span>
              </li>
            </ul>
          </CardContent>
      </Card>
    </div>
  );
}
