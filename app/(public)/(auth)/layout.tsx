"use client";
import AuthShell from "@/components/layouts/AuthShell";

export default function Layout({
   children,
}: {
    children: React.ReactNode;
}) {
    return <AuthShell>{children}</AuthShell>;
}