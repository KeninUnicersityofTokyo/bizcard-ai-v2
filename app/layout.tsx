import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "ReCard AI - スマート名刺管理 & AIメール生成",
    description: "名刺をスキャンして、AIが最適なビジネスメールを瞬時に生成。ビジネスのつながりを加速させる次世代の名刺管理アプリ。",
    openGraph: {
        title: "ReCard AI - スマート名刺管理 & AIメール生成",
        description: "名刺をスキャンして、AIが最適なビジネスメールを瞬時に生成。",
        url: "https://recard-ai.vercel.app", // Assuming URL, can be updated later
        siteName: "ReCard AI",
        locale: "ja_JP",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "ReCard AI - スマート名刺管理 & AIメール生成",
        description: "名刺をスキャンして、AIが最適なビジネスメールを瞬時に生成。",
    },
};

import MainLayout from "@/components/MainLayout";
import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ja">
            <body
                className={`${inter.className} antialiased bg-white text-gray-900`}
            >
                <AuthProvider>
                    <MainLayout>
                        {children}
                    </MainLayout>
                </AuthProvider>
            </body>
        </html>
    );
}
