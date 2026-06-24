"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

const PAGE_TITLES = {
  "/dashboard": "Dashboard",
  "/users": "Users",
  "/pregnancies": "Pregnancies",
  "/appointments": "Appointments",
  "/reminders": "Reminders",
  "/audio-library": "Audio Library",
  "/community": "Community",
  "/daily-goals": "Daily Goals",
  "/learn-tips": "Learn Tips",
  "/analytics": "Reports & Analytics",
  "/notifications": "Notifications",
  "/settings": "Settings",
  "/support": "Support & Feedback",
};

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    const stored = localStorage.getItem("mc_user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const title = PAGE_TITLES[pathname] || "MamaCare Admin";

  return (
    <div className="flex h-screen bg-[#F8FAFB] overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar
          title={title}
          onMenuClick={() => setSidebarOpen(true)}
          user={user}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
