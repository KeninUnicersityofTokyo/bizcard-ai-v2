"use client";

import { useEffect, useState } from "react";
import { Sparkles, Mail, User, Upload, ArrowLeft, Send, Loader2 } from "lucide-react";

export default function ProductDemo() {
    const [step, setStep] = useState<"scan" | "config" | "preview">("scan");

    useEffect(() => {
        const loop = async () => {
            while (true) {
                // Step 1: Scan (2.5s)
                setStep("scan");
                await new Promise((r) => setTimeout(r, 2500));

                // Step 2: Config (2.5s)
                setStep("config");
                await new Promise((r) => setTimeout(r, 2500));

                // Step 3: Preview (4s)
                setStep("preview");
                await new Promise((r) => setTimeout(r, 4000));
            }
        };
        loop();
    }, []);

    return (
        <div className="relative w-full max-w-[280px] mx-auto aspect-[9/18] bg-white rounded-[2rem] border-[6px] border-gray-900 shadow-2xl overflow-hidden ring-1 ring-gray-200">
            {/* Status Bar Mock */}
            <div className="absolute top-0 w-full h-7 bg-white z-20 flex justify-between px-5 items-center border-b border-gray-50">
                <div className="text-[10px] text-gray-900 font-bold">9:41</div>
                <div className="flex gap-1">
                    <div className="w-3 h-3 bg-black rounded-full"></div>
                    <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                </div>
            </div>

            {/* App Header Mock */}
            <div className="absolute top-7 w-full h-12 bg-white z-10 flex items-center px-4 border-b border-gray-100">
                <ArrowLeft className="w-4 h-4 text-gray-900 mr-3" />
                <span className="font-bold text-sm text-gray-900">New Contact</span>
            </div>

            {/* Content Container */}
            <div className="relative w-full h-full pt-[76px] bg-white">

                {/* --- SCAN PHASE --- */}
                <div
                    className={`absolute inset-0 pt-[76px] px-4 transition-opacity duration-500 ${step === "scan" ? "opacity-100" : "opacity-0 pointer-events-none"
                        }`}
                >
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-5 h-5 bg-black text-white rounded-full flex items-center justify-center text-[10px] font-bold">1</div>
                        <span className="font-bold text-xs text-gray-900">Scan Business Card</span>
                    </div>

                    <div className="w-full aspect-[4/3] border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center bg-gray-50 relative overflow-hidden">
                        <Upload className="w-6 h-6 text-gray-400 mb-2" />
                        <span className="text-[10px] text-gray-400 font-medium">Tap to scan</span>

                        {/* Scan Animation Overlay */}
                        <div className="absolute inset-0 bg-white/50 animate-pulse"></div>
                        <div className="absolute top-0 left-0 w-full h-0.5 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] animate-scan"></div>
                    </div>

                    <div className="mt-6 text-center">
                        <span className="text-[10px] text-gray-400">- or -</span>
                        <p className="text-[10px] text-gray-500 font-medium mt-1 underline">Enter manually</p>
                    </div>
                </div>

                {/* --- CONFIG PHASE --- */}
                <div
                    className={`absolute inset-0 pt-[76px] px-4 transition-opacity duration-500 ${step === "config" ? "opacity-100" : "opacity-0 pointer-events-none"
                        }`}
                >
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-5 h-5 bg-black text-white rounded-full flex items-center justify-center text-[10px] font-bold">2</div>
                        <span className="font-bold text-xs text-gray-900">Configuration</span>
                    </div>

                    <div className="space-y-3 mb-4">
                        <div>
                            <label className="text-[8px] font-bold text-gray-400 uppercase block mb-1">Company</label>
                            <div className="w-full h-8 bg-gray-50 border border-gray-200 rounded-lg px-2 flex items-center text-[10px] text-gray-900 font-medium">
                                Acme Corp.
                            </div>
                        </div>
                        <div>
                            <label className="text-[8px] font-bold text-gray-400 uppercase block mb-1">Name</label>
                            <div className="w-full h-8 bg-gray-50 border border-gray-200 rounded-lg px-2 flex items-center text-[10px] text-gray-900 font-medium">
                                John Doe
                            </div>
                        </div>
                    </div>

                    <div className="w-full h-10 bg-black text-white rounded-full flex items-center justify-center gap-2 shadow-lg scale-95 animate-pulse">
                        <Sparkles className="w-3 h-3" />
                        <span className="text-xs font-bold">Generate Draft</span>
                    </div>
                </div>

                {/* --- PREVIEW PHASE --- */}
                <div
                    className={`absolute inset-0 pt-[76px] px-4 transition-opacity duration-500 ${step === "preview" ? "opacity-100" : "opacity-0 pointer-events-none"
                        }`}
                >
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-5 h-5 bg-black text-white rounded-full flex items-center justify-center text-[10px] font-bold">3</div>
                        <span className="font-bold text-xs text-gray-900">Preview</span>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-4">
                        <div className="bg-gray-50 px-3 py-2 border-b border-gray-100 flex items-center gap-2">
                            <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                            <div className="flex-1 text-[8px] text-gray-500 font-medium truncate">takatera@g-advance.co.jp</div>
                        </div>
                        <div className="p-3">
                            <p className="text-[8px] font-bold text-gray-900 mb-1">面談のお礼</p>
                            <div className="text-[7px] text-gray-600 leading-relaxed whitespace-pre-wrap">
                                GLOBAL ADVANCE CO.,LTD.
                                MASATO TAKATERA様

                                平素より大変お世話になっております。
                                本日は貴重なお時間をいただき、誠にありがとうございました。

                                貴社のビジョンに大変感銘を受けました。
                                今後ともよろしくお願いいたします。
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <div className="flex-1 h-9 border border-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-[10px] font-medium text-gray-500">Edit</span>
                        </div>
                        <div className="flex-1 h-9 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-1 shadow-md">
                            <Send className="w-3 h-3" />
                            <span className="text-[10px] font-bold">Send</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
