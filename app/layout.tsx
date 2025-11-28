import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "ReCard AI - Smart Business Card Manager",
    description: "Scan business cards and generate AI emails instantly.",
};

import Sidebar from "@/components/Sidebar";
import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${inter.className} antialiased bg-white text-gray-900`}
            >
                <AuthProvider>
                    <div className="flex min-h-screen">
                        <Suspense fallback={<div className="w-72 bg-white border-r border-gray-100 hidden lg:block" />}>
                            <Sidebar />
                        </Suspense>
                        <main className="flex-1 p-4 md:p-8 overflow-y-auto lg:ml-72">
                            {children}
                        </main>
                    </div>
                </AuthProvider>
            </body>
        </html>
    );
}
