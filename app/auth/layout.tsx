// app/(dashboard)/layout.tsx
"use client";

import AuthLayout from "../components/AuthLayout"

export default function Layout({
   children,
}: {
    children: React.ReactNode;
}) {
    return <AuthLayout>{children}</AuthLayout>;
}