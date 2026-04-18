import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, TrendingUp, Activity } from "lucide-react";

export default async function AdminOverviewPage() {
  const [totalUsers, proUsers, totalRoadmaps, totalInterviews] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { plan: "PRO" } }),
    db.roadmap.count(),
    db.interviewSession.count(),
  ]);

  const recentUsers = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      name: true,
      email: true,
      plan: true,
      targetRole: true,
      createdAt: true,
    },
  });

  const estimatedMRR = proUsers * 19;

  const stats = [
    { label: "Total Users", value: totalUsers, icon: Users, color: "text-blue-500" },
    { label: "Pro Users", value: proUsers, icon: CreditCard, color: "text-primary" },
    { label: "Est. MRR", value: `$${estimatedMRR.toLocaleString()}`, icon: TrendingUp, color: "text-emerald-500" },
    { label: "Interviews Done", value: totalInterviews, icon: Activity, color: "text-orange-500" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Overview</h1>
        <p className="text-muted-foreground mt-1">Platform metrics and user management.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center gap-2 mb-3">
                <s.icon className={`h-5 w-5 ${s.color}`} />
                <span className="text-sm text-muted-foreground">{s.label}</span>
              </div>
              <div className="text-3xl font-bold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent signups</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-0">
            {recentUsers.map((u, i) => (
              <div
                key={u.id}
                className={`flex items-center justify-between py-3 ${i < recentUsers.length - 1 ? "border-b" : ""}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{u.name ?? u.email}</p>
                  <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  {u.targetRole && (
                    <span className="text-xs text-muted-foreground hidden md:block">
                      → {u.targetRole.replace(/_/g, " ")}
                    </span>
                  )}
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    u.plan === "PRO"
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {u.plan}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-5 pb-5">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{totalRoadmaps}</div>
              <div className="text-sm text-muted-foreground">Roadmaps generated</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{totalUsers > 0 ? Math.round((proUsers / totalUsers) * 100) : 0}%</div>
              <div className="text-sm text-muted-foreground">Conversion rate</div>
            </div>
            <div>
              <div className="text-2xl font-bold">${(proUsers * 159).toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">ARR (if all annual)</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
