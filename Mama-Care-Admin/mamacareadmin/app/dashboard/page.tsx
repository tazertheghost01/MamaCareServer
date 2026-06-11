"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import StatCard from "@/components/dashboard/StatCard";
import RecentUsersTable from "@/components/dashboard/RecentUsersTable";
import UserGrowthChart from "@/components/dashboard/UserGrowthChart";
import { Users, Baby, Calendar, Bell, Users2 } from "lucide-react";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [liveStats, setLiveStats] = useState<any>(null);
  // Track loading state for the chart/stats
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchDashboardMetrics() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/dashboard/stats");
        if (res.ok) {
          const data = await res.json();
          setLiveStats(data);
        }
      } catch (error) {
        console.error("Failed fetching dashboard metrics:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDashboardMetrics();
  }, []);

  const stats = [
    { label: "Total Users", value: liveStats?.totalUsers || "...", icon: Users, change: liveStats?.userChange || "0%" },
    { label: "Active Pregnancies", value: liveStats?.activePregnancies || "...", icon: Baby, change: liveStats?.pregnancyChange || "0%" },
    { label: "Appointments", value: liveStats?.appointments || "...", icon: Calendar, change: liveStats?.appointmentChange || "0%" },
    { label: "Reminders Sent", value: liveStats?.remindersSent || "...", icon: Bell, change: liveStats?.reminderChange || "0%" },
    { label: "Community Posts", value: liveStats?.communityPosts || "...", icon: Users2, change: liveStats?.postsChange || "0%" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">
            Welcome back, {session?.user?.name || "User"}!
          </h1>
          <p className="text-muted-foreground mt-1">Here is what is happening with MamaCare today.</p>
        </div>
        <div className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat, index) => (
          <StatCard key={index} label={stat.label} value={stat.value} icon={stat.icon} change={stat.change} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <UserGrowthChart 
            data={liveStats?.chartData || []} 
            isLoading={isLoading} 
          />
        </div>
        <div className="xl:col-span-3">
          <RecentUsersTable />
        </div>
      </div>
    </div>
  );
}
