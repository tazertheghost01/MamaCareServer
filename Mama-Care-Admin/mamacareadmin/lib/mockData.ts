// lib/mockData.ts
export type RecentUser = {
  id: string;
  name: string;
  location: string;
  gestationalAge: string;
  joinedOn: string;
  status: "Active" | "Inactive";
};

export const mockData = {
  stats: {
    totalUsers: 18540,
    activePregnancies: 7842,
    appointments: 2409,
    remindersSent: 24892,
    communityPosts: 1256,
  },

  recentUsers: [
    { id: "1", name: "Adesola Nneka", location: "Lagos", gestationalAge: "24 weeks", joinedOn: "May 26, 2026", status: "Active" },
    { id: "2", name: "Maryam Bello", location: "Abuja", gestationalAge: "16 weeks", joinedOn: "May 24, 2026", status: "Active" },
    { id: "3", name: "Funke Adewale", location: "Ibadan", gestationalAge: "32 weeks", joinedOn: "May 23, 2026", status: "Active" },
    { id: "4", name: "Sarah Johnson", location: "PortHarcourt", gestationalAge: "12 weeks", joinedOn: "May 22, 2026", status: "Inactive" },
    { id: "5", name: "Blessing Okafor", location: "Enugu", gestationalAge: "28 weeks", joinedOn: "May 21, 2026", status: "Active" },
  ],
};