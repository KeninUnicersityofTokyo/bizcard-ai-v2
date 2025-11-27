import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "BizCard Instant Reply",
    description: "Generate instant reply emails from business cards.",
};

import Sidebar from "@/components/Sidebar";

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
                <div className="flex min-h-screen">
                    <Sidebar />
                    <main className="flex-1 p-4 md:p-8 overflow-y-auto lg:ml-72">
                        {children}
                    </main>
                </div>
            </body>
        </html>
    );
}
