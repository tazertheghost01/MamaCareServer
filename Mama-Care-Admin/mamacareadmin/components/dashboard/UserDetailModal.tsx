import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";


export interface ActiveUser {
  id: string | number;
  name: string;
  location: string;
  gestationalAge: string;
  joinedOn: string;
  status: "Active" | "Inactive" | "Completed";
}

type Props = {
  user: ActiveUser | null;
  open: boolean;
  onClose: () => void;
};

export default function UserDetailModal({ user, open, onClose }: Props) {
  if (!user) return null;

  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "MC";

  
  const statusColors: Record<ActiveUser["status"], string> = {
    Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Inactive: "bg-amber-50 text-amber-700 border-amber-200",
    Completed: "bg-blue-50 text-blue-700 border-blue-200",
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">User Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          
          <div className="flex justify-center">
            <Avatar className="h-24 w-24 border-2 border-pink-100 shadow-sm">
              <AvatarFallback className="text-3xl font-semibold bg-pink-50 text-pink-600">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>

          
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900">{user.name}</h3>
            <p className="text-gray-500 mt-1">{user.location}</p>
          </div>

          
          <div className="bg-gray-50 p-4 rounded-xl grid grid-cols-2 gap-x-4 gap-y-3 text-sm border border-gray-100">
            <div>
              <span className="block text-xs text-gray-500 font-medium uppercase tracking-wider">User ID</span>
              <span className="font-semibold text-gray-900">#{user.id}</span>
            </div>
            <div>
              <span className="block text-xs text-gray-500 font-medium uppercase tracking-wider">Status</span>
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusColors[user.status] || "bg-gray-100"}`}>
                {user.status}
              </span>
            </div>
            <div>
              <span className="block text-xs text-gray-500 font-medium uppercase tracking-wider">Gestational Age</span>
              <span className="font-semibold text-gray-900">{user.gestationalAge}</span>
            </div>
            <div>
              <span className="block text-xs text-gray-500 font-medium uppercase tracking-wider">Joined On</span>
              <span className="font-semibold text-gray-900">{user.joinedOn}</span>
            </div>
          </div>

          
          <Button className="w-full py-6 text-base bg-pink-600 hover:bg-pink-700 text-white rounded-xl shadow-sm transition-all" onClick={onClose}>
            Close Window
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
