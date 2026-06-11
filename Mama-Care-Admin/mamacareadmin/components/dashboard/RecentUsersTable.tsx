"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Header from "@/components/layout/Header";
import StatCard from "@/components/dashboard/StatCard";
import RecentUsersTable from "@/components/dashboard/RecentUsersTable";
import { Users, Baby, Calendar, Bell, Users2, LayoutDashboard } from "lucide-react";


interface DashboardStats {
  totalUsers: number;
  userChange: string;
  activePregnancies: number;
  pregnancyChange: string;
  appointments: number;
  appointmentChange: string;
  remindersSent: number;
  reminderChange: string;
  communityPosts: number;
  postsChange: string;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [statsData, setStatsData] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function getLiveMetrics() {
      try {
        const response = await fetch("/api/dashboard/stats");
        if (response.ok) {
          const data = await response.json();
          setStatsData(data);
        }
      } catch (error) {
        console.error("Failed to load dashboard statistics:", error);
      } finally {
        setIsLoading(false);
      }
    }
    getLiveMetrics();
  }, []);

  const stats = [
    { 
      label: "Total Users", 
      value: isLoading ? "..." : statsData?.totalUsers ?? 0, 
      icon: Users, 
      change: statsData?.userChange ?? "0%" 
    },
    { 
      label: "Active Pregnancies", 
      value: isLoading ? "..." : statsData?.activePregnancies ?? 0, 
      icon: Baby, 
      change: statsData?.pregnancyChange ?? "0%" 
    },
    { 
      label: "Appointments", 
      value: isLoading ? "..." : statsData?.appointments ?? 0, 
      icon: Calendar, 
      change: statsData?.appointmentChange ?? "0%" 
    },
    { 
      label: "Reminders Sent", 
      value: isLoading ? "..." : statsData?.remindersSent ?? 0, 
      icon: Bell, 
      change: statsData?.reminderChange ?? "0%" 
    },
    { 
      label: "Community Posts", 
      value: isLoading ? "..." : statsData?.communityPosts ?? 0, 
      icon: Users2, 
      change: statsData?.postsChange ?? "0%" 
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        
        
        <aside className="w-64 hidden md:block border-r bg-white h-[calc(100vh-73px)] p-6">
          <nav className="space-y-2">
            <a href="#" className="flex items-center gap-3 px-4 py-3 bg-pink-50 text-pink-600 rounded-xl font-medium">
              <LayoutDashboard className="h-5 w-5" /> Dashboard
            </a>
          </nav>
        </aside>

        
        <main className="flex-1 p-6 space-y-8">
          <div>
            <h1 className="text-3xl font-semibold">
              Welcome back, {session?.user?.name || "Admin"}!
            </h1>
            <p className="text-gray-600">Here is what is happening with MamaCare today.</p>
          </div>

          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {stats.map((stat, i) => (
              <StatCard key={i} {...stat} />
            ))}
          </div>

          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <RecentUsersTable />
          </div>
        </main>

      </div>
    </div>
  );
}
