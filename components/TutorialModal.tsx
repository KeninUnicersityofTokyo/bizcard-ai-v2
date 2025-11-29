"use client";

import { useState } from "react";
import { X, ChevronRight, ChevronLeft, Key, Settings, Scan, Send, Sparkles } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface TutorialModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function TutorialModal({ isOpen, onClose }: TutorialModalProps) {
    const { t } = useLanguage();
    const [step, setStep] = useState(1);
    const totalSteps = 4;

    if (!isOpen) return null;

    const handleNext = () => {
        if (step < totalSteps) {
            setStep(step + 1);
        } else {
            onClose();
        }
    };

    const handlePrev = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col h-[500px]">

                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="bg-black text-white text-xs font-bold px-2 py-1 rounded-full">Guide</span>
                        <h2 className="font-bold text-gray-900">ReCard AI 使い方ガイド</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="Close tutorial"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-center text-center">

                    {/* Step 1: Welcome */}
                    {step === 1 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6 max-w-md">
                            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Sparkles className="w-10 h-10 text-blue-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">ReCard AIへようこそ</h3>
                            <p className="text-gray-600 leading-relaxed">
                                ReCard AIは、名刺をスキャンするだけで、相手に合わせた最適なビジネスメールをAIが瞬時に作成するツールです。
                                面倒な挨拶文や構成を考える時間をゼロにします。
                            </p>
                        </div>
                    )}

                    {/* Step 2: API Key */}
                    {step === 2 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6 max-w-md">
                            <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Key className="w-10 h-10 text-purple-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">まずはAPIキーを設定</h3>
                            <p className="text-gray-600 leading-relaxed">
                                このアプリは、あなたのGoogle Gemini APIキーを使用します。
                                <br />
                                左上のメニュー <Settings className="w-4 h-4 inline mx-1" /> から <strong>Settings &gt; API Key</strong> を開き、キーを保存してください。
                            </p>
                            <div className="bg-gray-50 p-4 rounded-xl text-sm text-left border border-gray-200">
                                <p className="font-bold mb-2">💡 安全性について</p>
                                <p className="text-gray-500">
                                    APIキーはあなたのブラウザ内にのみ保存され、サーバーには保存されません。
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Settings */}
                    {step === 3 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6 max-w-md">
                            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Settings className="w-10 h-10 text-green-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">自分好みにカスタマイズ</h3>
                            <p className="text-gray-600 leading-relaxed">
                                <strong>Settings &gt; Signature</strong> で署名を登録しておくと、メールの末尾に自動で追加されます。
                                <br />
                                また、表示言語（日本語/英語）の切り替えも可能です。
                            </p>
                        </div>
                    )}

                    {/* Step 4: Usage */}
                    {step === 4 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6 max-w-md">
                            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Scan className="w-10 h-10 text-orange-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">使い方はシンプル</h3>
                            <div className="space-y-4 text-left">
                                <div className="flex items-start gap-3">
                                    <div className="bg-black text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</div>
                                    <p className="text-gray-600"><strong>New Contact</strong> から名刺を撮影・アップロード</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="bg-black text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</div>
                                    <p className="text-gray-600">「どこで会ったか」「何を話したか」を音声かテキストで入力</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="bg-black text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</div>
                                    <p className="text-gray-600"><strong>Generate</strong> ボタンで下書き完成！あとは微調整して送信するだけ。</p>
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer / Navigation */}
                <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50">
                    <div className="flex gap-1">
                        {[1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className={`w-2 h-2 rounded-full transition-colors ${step === i ? "bg-black" : "bg-gray-300"}`}
                            />
                        ))}
                    </div>

                    <div className="flex gap-3">
                        {step > 1 && (
                            <button
                                onClick={handlePrev}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                            >
                                Back
                            </button>
                        )}
                        <button
                            onClick={handleNext}
                            className="px-6 py-2 bg-black text-white hover:bg-gray-800 rounded-lg font-bold transition-colors flex items-center gap-2"
                        >
                            {step === totalSteps ? "Get Started" : "Next"}
                            {step < totalSteps && <ChevronRight className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
