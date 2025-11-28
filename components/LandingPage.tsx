"use client";

import { useAuth } from "@/context/AuthContext";
import { ArrowRight, Check, Sparkles, Zap, Shield, Mail, Smartphone, FolderOpen } from "lucide-react";

export default function LandingPage() {
    const { signInWithGoogle } = useAuth();

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-gray-200">
            {/* Navbar */}
            <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-sm z-50 border-b border-gray-100">
                <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
                        <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        BizCard AI
                    </div>
                    <button
                        onClick={signInWithGoogle}
                        className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
                    >
                        Log in
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6">
                <div className="max-w-3xl mx-auto text-center space-y-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        Now available for everyone
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight">
                        Your business cards, <br />
                        <span className="text-gray-400">reimagined with AI.</span>
                    </h1>
                    <p className="text-xl text-gray-500 max-w-xl mx-auto leading-relaxed">
                        Scan cards, generate professional emails instantly, and manage your network with a simple, Notion-style interface.
                    </p>
                    <div className="pt-4">
                        <button
                            onClick={signInWithGoogle}
                            className="group inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-xl font-medium text-lg hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                        >
                            Get Started
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <p className="mt-4 text-xs text-gray-400">No credit card required · Free to start</p>
                    </div>
                </div>
            </section>

            {/* Feature Grid (Notion Style) */}
            <section className="py-20 px-6 bg-gray-50/50">
                <div className="max-w-5xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-8">
                        <FeatureCard
                            icon={<Smartphone className="w-6 h-6" />}
                            title="Instant Scanning"
                            description="Upload a photo of any business card. Our AI extracts details with 99% accuracy."
                        />
                        <FeatureCard
                            icon={<Mail className="w-6 h-6" />}
                            title="AI Email Generation"
                            description="Draft professional follow-up emails in seconds. Formal, casual, or custom tones."
                        />
                        <FeatureCard
                            icon={<FolderOpen className="w-6 h-6" />}
                            title="Smart Organization"
                            description="Group contacts into folders. Keep your network organized and accessible."
                        />
                        <FeatureCard
                            icon={<Shield className="w-6 h-6" />}
                            title="Secure & Private"
                            description="Your data is encrypted and stored securely. You own your contacts."
                        />
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section className="py-24 px-6">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-16">How it works</h2>
                    <div className="space-y-12">
                        <Step
                            number="01"
                            title="Scan a card"
                            description="Take a photo of a business card. We'll automatically digitize the contact info."
                        />
                        <Step
                            number="02"
                            title="Add context"
                            description="Voice record or type a quick note about where you met and what you discussed."
                        />
                        <Step
                            number="03"
                            title="Send follow-up"
                            description="Review the AI-generated email draft and send it directly from your mail app."
                        />
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 px-6 border-t border-gray-100">
                <div className="max-w-3xl mx-auto text-center space-y-8">
                    <h2 className="text-3xl font-bold">Ready to upgrade your networking?</h2>
                    <button
                        onClick={signInWithGoogle}
                        className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-xl font-medium text-lg hover:bg-gray-800 transition-all shadow-lg"
                    >
                        Start for free
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-gray-100 text-center text-sm text-gray-400">
                <p>&copy; {new Date().getFullYear()} BizCard AI. All rights reserved.</p>
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
