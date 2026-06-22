"use client";
import { useState } from "react";
import { Menu, Search, Bell, ChevronDown, User } from "lucide-react";

export default function Topbar({ title, onMenuClick, user }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "AD";

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-gray-500 hover:text-gray-700 p-1"
        >
          <Menu size={22} />
        </button>
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Search — hidden on small screens */}
        <div className="hidden md:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 w-56">
          <Search size={15} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search anything..."
            className="bg-transparent text-sm text-gray-600 outline-none w-full placeholder-gray-400"
          />
        </div>

        {/* Bell */}
        <button className="relative p-2 rounded-lg hover:bg-gray-50 text-gray-500">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
        </button>

        {/* User dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-50"
          >
            <div className="w-8 h-8 rounded-full bg-[#1A7A4A] flex items-center justify-center text-white text-xs font-bold">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-gray-800 leading-tight">
                {user?.name || "Admin"}
              </p>
              <p className="text-[10px] text-gray-400 leading-tight">
                {user?.role || "Super Admin"}
              </p>
            </div>
            <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-800">{user?.name || "Admin"}</p>
                <p className="text-[10px] text-gray-400">{user?.email || ""}</p>
              </div>
              <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
                <User size={14} />
                Profile
              </button>
              <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50">
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
