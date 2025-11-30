"use client";

import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import { Suspense } from "react";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();

    // While loading, we can show a loading state or just nothing to prevent flash
    if (loading) {
        return <div className="min-h-screen bg-white" />;
    }

    // If not logged in, show full width content (Landing Page)
    if (!user) {
        return <main className="min-h-screen">{children}</main>;
    }

    // If logged in, show Sidebar and content with margin
    return (
        <div className="flex min-h-screen">
            <Suspense fallback={<div className="w-64 bg-white border-r border-gray-100 hidden lg:block" />}>
                <Sidebar />
            </Suspense>
            <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
