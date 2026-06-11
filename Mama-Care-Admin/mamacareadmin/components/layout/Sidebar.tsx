"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Baby, 
  Calendar, 
  Bell, 
  Headphones, 
  Users2, 
  BarChart3, 
  Settings 
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Users", href: "/dashboard/users", icon: Users },
  { label: "Pregnancies", href: "/dashboard/pregnancies", icon: Baby },
  { label: "Appointments", href: "/dashboard/appointments", icon: Calendar },
  { label: "Reminders", href: "/dashboard/reminders", icon: Bell },
  { label: "Audio Library", href: "/dashboard/audio", icon: Headphones },
  { label: "Community", href: "/dashboard/community", icon: Users2 },
  { label: "Reports & Analytics", href: "/dashboard/analytics", icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 hidden md:block border-r bg-sidebar text-sidebar-foreground h-[calc(100vh-73px)] overflow-y-auto">
      <div className="p-6">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all sidebar-link ${
                  isActive 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Settings */}
        <div className="mt-8 pt-6 border-t border-sidebar-border">
          <Link
            href="/dashboard/settings"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              pathname === "/dashboard/settings"
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
            }`}
          >
            <Settings className="h-5 w-5" />
            Settings
          </Link>
        </div>
      </div>
    </aside>
  );
}