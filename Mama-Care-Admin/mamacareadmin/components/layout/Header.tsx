"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Bell, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const router = useRouter();

  const handleLogout = () => {
    // TODO: Clear any auth tokens, localStorage, cookies later
    if (confirm("Are you sure you want to log out?")) {
      router.push("/login"); 
    }
  };

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="flex items-center justify-between px-6 py-4">
        
       
        <div className="flex items-center gap-3">
          <Image 
            src="/logo.png" 
            alt="Mamacare Logo" 
            width={140} 
            height={40} 
            className="h-9 w-auto cursor-pointer"
            priority
            onClick={() => router.push("/dashboard")}
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="relative w-80 max-w-xs">
            <input 
              type="text" 
              placeholder="Search anything..." 
              className="w-full pl-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500" 
            />
          </div>

          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar className="cursor-pointer">
                <AvatarFallback className="bg-pink-100 text-pink-700">WJ</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/settings")}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleLogout}
                className="text-red-600 focus:text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}