"use client";

import { usePathname } from "next/navigation";
import AdminLayout from "@/components/layout/AdminLayout";

export default function ConditionalLayout({ children }) {
    const pathname = usePathname();

    // Define paths that should skip the AdminLayout
    const excludedPaths = ["/admin/login", "/admin/register", "/admin/forgot-password"];
    const isExcluded = excludedPaths.includes(pathname);

    // If it is an auth page, render the page directly without AdminLayout
    if (isExcluded) {
        return <>{children}</>;
    }

    // Otherwise, wrap the page in your AdminLayout
    return <AdminLayout>{children}</AdminLayout>;
}
