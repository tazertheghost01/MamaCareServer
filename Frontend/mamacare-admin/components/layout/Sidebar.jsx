"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Baby,
  CalendarCheck,
  Bell,
  Headphones,
  MessageSquare,
  BarChart2,
  BellRing,
  Settings,
  MessageCircleQuestion,
  LogOut,
  X,
  Target,
  BookOpen,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Users", href: "/users", icon: Users },
  { label: "Pregnancies", href: "/pregnancies", icon: Baby },
  { label: "Appointments", href: "/appointments", icon: CalendarCheck },
  { label: "Reminders", href: "/reminders", icon: Bell },
  { label: "Audio Library", href: "/audio-library", icon: Headphones },
  { label: "Community", href: "/community", icon: MessageSquare },
  { label: "Daily Goals", href: "/daily-goals", icon: Target },
  { label: "Learn Tips", href: "/learn-tips", icon: BookOpen },
  { label: "Reports & Analytics", href: "/analytics", icon: BarChart2 },
  { label: "Notifications", href: "/notifications", icon: BellRing },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Support & Feedback", href: "/support", icon: MessageCircleQuestion },
];

export default function Sidebar({ open, onClose }) {
  const pathname = usePathname();

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-[220px] bg-white border-r border-gray-100 z-30
          flex flex-col transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#1A7A4A] flex items-center justify-center">
              <Baby size={16} color="white" />
            </div>
            <span className="font-bold text-[#1A7A4A] text-[15px]">MamaCare</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm font-medium transition-colors
                  ${active
                    ? "bg-[#E8F5EE] text-[#1A7A4A] border-r-[3px] border-[#1A7A4A]"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                  }
                `}
              >
                <Icon size={17} strokeWidth={1.8} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout + User */}
        <div className="px-3 pb-4 border-t border-gray-100 pt-3">
          <button className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
            <LogOut size={17} strokeWidth={1.8} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
