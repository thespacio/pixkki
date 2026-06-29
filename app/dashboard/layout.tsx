// app/(dashboard)/layout.tsx
"use client";

import DashboardLayout from "@/modules/dashboard/components/DashboardLayout";

export default function Layout({
   children,
}: {
    children: React.ReactNode;
}) {
    return <DashboardLayout>{children}</DashboardLayout>;
}