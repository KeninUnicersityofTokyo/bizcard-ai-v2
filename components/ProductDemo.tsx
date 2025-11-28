"use client";

import { useEffect, useState } from "react";
import { Sparkles, Mail, User, Building, ScanLine } from "lucide-react";

export default function ProductDemo() {
    const [step, setStep] = useState<"scan" | "process" | "result">("scan");

    useEffect(() => {
        const loop = async () => {
            while (true) {
                // Step 1: Scan (3s)
                setStep("scan");
                await new Promise((r) => setTimeout(r, 3000));

                // Step 2: Process (1.5s)
                setStep("process");
                await new Promise((r) => setTimeout(r, 1500));

                // Step 3: Result (4s)
                setStep("result");
                await new Promise((r) => setTimeout(r, 4000));
            }
        };
        loop();
    }, []);

    return (
        <div className="relative w-full max-w-[320px] mx-auto aspect-[9/19] bg-gray-900 rounded-[3rem] border-8 border-gray-800 shadow-2xl overflow-hidden ring-1 ring-white/10">
            {/* Status Bar Mock */}
            <div className="absolute top-0 w-full h-6 bg-black/20 z-20 flex justify-between px-6 items-center">
                <div className="text-[10px] text-white font-medium">9:41</div>
                <div className="flex gap-1">
                    <div className="w-3 h-3 bg-white rounded-full opacity-20"></div>
                    <div className="w-3 h-3 bg-white rounded-full opacity-20"></div>
                </div>
            </div>

            {/* Content Container */}
            <div className="relative w-full h-full bg-white flex flex-col">

                {/* --- SCAN PHASE --- */}
                <div
                    className={`absolute inset-0 flex items-center justify-center bg-gray-100 transition-opacity duration-500 ${step === "scan" ? "opacity-100" : "opacity-0 pointer-events-none"
                        }`}
                >
                    <div className="relative w-64 h-40 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 p-4 flex flex-col justify-between transform transition-transform duration-700 hover:scale-105">
                        {/* Mock Business Card Content */}
                        <div>
                            <div className="w-8 h-8 bg-blue-600 rounded-lg mb-3"></div>
                            <div className="h-3 w-32 bg-gray-800 rounded mb-2"></div>
                            <div className="h-2 w-20 bg-gray-400 rounded"></div>
                        </div>
                        <div className="space-y-1">
                            <div className="h-2 w-full bg-gray-100 rounded"></div>
                            <div className="h-2 w-2/3 bg-gray-100 rounded"></div>
                        </div>

                        {/* Scan Line */}
                        {step === "scan" && (
                            <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-scan" />
                        )}
                    </div>

                    <div className="absolute bottom-20 flex flex-col items-center gap-2">
                        <div className="w-16 h-16 rounded-full border-4 border-blue-500 flex items-center justify-center">
                            <div className="w-14 h-14 bg-blue-500 rounded-full animate-pulse"></div>
                        </div>
                        <p className="text-sm font-bold text-gray-500">Scanning...</p>
                    </div>
                </div>

                {/* --- PROCESS PHASE --- */}
                <div
                    className={`absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-10 transition-opacity duration-500 ${step === "process" ? "opacity-100" : "opacity-0 pointer-events-none"
                        }`}
                >
                    <Sparkles className="w-12 h-12 text-yellow-400 animate-spin-slow mb-4" />
                    <p className="text-white font-bold text-lg animate-pulse">AI Analyzing...</p>
                    <p className="text-gray-400 text-sm mt-2">Extracting details</p>
                </div>

                {/* --- RESULT PHASE --- */}
                <div
                    className={`absolute inset-0 bg-gray-50 flex flex-col transition-transform duration-500 ${step === "result" ? "translate-y-0" : "translate-y-full"
                        }`}
                >
                    {/* Header */}
                    <div className="bg-white p-4 pt-12 border-b border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 text-green-600 font-bold text-sm mb-1">
                            <Sparkles className="w-4 h-4" />
                            <span>AI Draft Ready</span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Email Generated</h2>
                    </div>

                    {/* Email Preview */}
                    <div className="p-4 space-y-4">
                        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-3">
                            <div className="flex items-center gap-3 border-b border-gray-50 pb-3">
                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                    <User className="w-4 h-4 text-gray-500" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">To</p>
                                    <p className="text-sm font-bold text-gray-900">yamada@example.com</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-xs font-bold text-gray-400 uppercase">Subject</p>
                                <p className="text-sm font-medium text-gray-900">Thank you for the meeting</p>
                            </div>

                            <div className="space-y-2 pt-2">
                                <div className="h-2 w-full bg-gray-100 rounded"></div>
                                <div className="h-2 w-full bg-gray-100 rounded"></div>
                                <div className="h-2 w-3/4 bg-gray-100 rounded"></div>
                                <div className="h-2 w-full bg-gray-100 rounded"></div>
                            </div>
                        </div>

                        <button className="w-full bg-black text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transform active:scale-95 transition-transform">
                            <Mail className="w-4 h-4" />
                            Send Email
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
