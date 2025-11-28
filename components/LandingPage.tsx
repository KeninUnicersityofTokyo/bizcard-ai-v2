"use client";

import { useAuth } from "@/context/AuthContext";
import { ArrowRight, Check, Sparkles, Zap, Shield, Mail, Smartphone, FolderOpen } from "lucide-react";
import ProductDemo from "./ProductDemo";

export default function LandingPage() {
    const { signInWithGoogle } = useAuth();

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-gray-200">
            {/* Navbar */}
            <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-sm z-50 border-b border-gray-100 pt-[env(safe-area-inset-top)]">
                <div className="w-full px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
                        <img src="/logo.png" alt="ReCard AI Logo" className="w-8 h-8 object-contain" />
                        ReCard AI
                    </div>
                    <button
                        onClick={() => signInWithGoogle()}
                        className="bg-black text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-all shadow-sm hover:shadow-md"
                    >
                        Log in
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6 overflow-hidden">
                <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
                    <div className="text-center lg:text-left space-y-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            Now available for everyone
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight">
                            Your business cards, <br />
                            <span className="text-gray-400">reimagined with AI.</span>
                        </h1>
                        <p className="text-xl text-gray-500 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                            名刺をスキャンして、AIが下書きを自動生成。<br />
                            直感的なシンプルさで、スマートに管理。
                        </p>
                        <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <button
                                onClick={() => signInWithGoogle()}
                                className="group inline-flex items-center justify-center gap-2 bg-black text-white px-8 py-4 rounded-xl font-medium text-lg hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                            >
                                Get Started
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button
                                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-medium text-lg text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                Learn more
                            </button>
                        </div>
                        <p className="text-xs text-gray-400">No credit card required · Free to start</p>
                    </div>

                    {/* Product Demo Animation */}
                    <div className="relative mx-auto lg:mr-0 w-full max-w-[320px]">
                        <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-[3.5rem] opacity-20 blur-2xl animate-pulse"></div>
                        <ProductDemo />
                    </div>
                </div>
            </section>

            {/* Feature Grid */}
            <section className="py-20 px-6 bg-gray-50/50">
                <div className="max-w-5xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-8">
                        <FeatureCard
                            icon={<Smartphone className="w-6 h-6" />}
                            title="Instant Scanning"
                            description="名刺を写真に撮るだけ。AIが連絡先情報を99%の精度で自動抽出します。"
                        />
                        <FeatureCard
                            icon={<Mail className="w-6 h-6" />}
                            title="AI Email Generation"
                            description="お礼メールやフォローアップを数秒で作成。フォーマルからカジュアルまで、相手に合わせたトーンで。"
                        />
                        <FeatureCard
                            icon={<FolderOpen className="w-6 h-6" />}
                            title="Smart Organization"
                            description="フォルダ分けで連絡先を整理。必要な情報をすぐに見つけられます。"
                        />
                        <FeatureCard
                            icon={<Shield className="w-6 h-6" />}
                            title="Secure & Private"
                            description="データは暗号化され安全に保存されます。あなたの連絡先はあなただけのものです。"
                        />
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section id="how-it-works" className="py-24 px-6">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-16">How it works</h2>
                    <div className="space-y-12">
                        <Step
                            number="01"
                            title="Scan a card"
                            description="名刺の写真をアップロード。連絡先情報を自動でデジタル化します。"
                        />
                        <Step
                            number="02"
                            title="Add context"
                            description="「どこで会ったか」「何を話したか」を音声やテキストでメモ。AIがそれをメールに反映します。"
                        />
                        <Step
                            number="03"
                            title="Send follow-up"
                            description="生成されたメール下書きを確認し、メーラーを起動して送信するだけ。"
                        />
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 px-6 border-t border-gray-100">
                <div className="max-w-3xl mx-auto text-center space-y-8">
                    <h2 className="text-3xl font-bold">Ready to upgrade your networking?</h2>
                    <button
                        onClick={() => signInWithGoogle()}
                        className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-xl font-medium text-lg hover:bg-gray-800 transition-all shadow-lg"
                    >
                        Start for free
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-gray-100 text-center text-sm text-gray-400">
                <p>&copy; {new Date().getFullYear()} ReCard AI. All rights reserved.</p>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-6 text-gray-900">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-3">{title}</h3>
            <p className="text-gray-500 leading-relaxed">{description}</p>
        </div>
    );
}

function Step({ number, title, description }: { number: string, title: string, description: string }) {
    return (
        <div className="flex gap-8 items-start md:items-center group">
            <div className="text-4xl font-bold text-gray-200 group-hover:text-gray-900 transition-colors font-mono">
                {number}
            </div>
            <div className="space-y-2">
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="text-gray-500 leading-relaxed max-w-lg">{description}</p>
            </div>
        </div>
    );
}
