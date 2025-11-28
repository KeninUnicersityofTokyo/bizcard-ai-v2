"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "@/components/ImageUploader";
import VoiceInput from "@/components/VoiceInput";
import EmailPreview from "@/components/EmailPreview";
import { generateEmail } from "@/actions/generateEmail";
import { useAuth } from "@/context/AuthContext";
import { saveContact } from "@/lib/db";

import { Loader2, Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewContactPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [image, setImage] = useState<string | null>(null);
    const [context, setContext] = useState("");
    const [platform, setPlatform] = useState<"email" | "linkedin" | "slack">("email");
    const [tone, setTone] = useState<"3" | "2" | "1">("2");
    const [manualDetails, setManualDetails] = useState({ name: "", company: "", email: "" });
    const [isManualMode, setIsManualMode] = useState(false);
    const [isManualDetailsOpen, setIsManualDetailsOpen] = useState(false);
    const [generatedEmail, setGeneratedEmail] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleImageSelected = async (base64: string) => {
        setImage(base64);
        setError(null);
        setIsLoading(true);

        try {
            // Auto-scan with selected settings
            const result = await generateEmail(
                base64,
                context, // Use entered context
                undefined,
                platform, // Use selected platform
                tone // Use selected tone
            );
            setGeneratedEmail(result);
            setStep(3);
        } catch (error: any) {
            console.error(error);
            setError(error.message || "予期せぬエラーが発生しました。");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSkipToManual = () => {
        setIsManualMode(true);
        setStep(2);
        setError(null);
    };

    const handleGenerate = async () => {
        if (!image && !isManualMode) return;

        setIsLoading(true);
        setError(null);
        try {
            const result = await generateEmail(
                image,
                context,
                isManualMode ? manualDetails : undefined,
                platform,
                tone
            );
            setGeneratedEmail(result);
            setStep(3);
        } catch (error: any) {
            console.error(error);
            setError(error.message || "予期せぬエラーが発生しました。");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (emailData: any, folderId: string): Promise<boolean> => {
        if (!user) {
            alert("ログインが必要です。");
            return false;
        }

        try {
            // Fire and forget - don't await the result for UI responsiveness
            saveContact(user.uid, {
                folderId: folderId || "drafts",
                name: emailData.name,
                company: isManualMode ? manualDetails.company : "Unknown",
                email: emailData.email,
                context,
                imageBase64: null, // Never save image as per user request
                generatedEmail: {
                    subject: emailData.subject,
                    body: emailData.body,
                },
            }).catch(e => {
                console.error("Background save failed:", e);
            });

            return true;
        } catch (e: any) {
            console.error(e);
            alert(`保存処理の開始に失敗しました: ${e.message}`);
            return false;
        }
    };

    const handleSaveSuccess = (folderId: string) => {
        router.push(`/?folderId=${folderId}`);
    };

    return (
        <div className="max-w-xl mx-auto pb-20">
            <header className="mb-10 flex items-center gap-4">
                <Link href="/" className="p-2.5 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-gray-900" />
                </Link>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">新規コンタクト</h1>
            </header>

            {error && (
                <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-sm text-center">
                    {error}
                </div>
            )}

            <div className="space-y-8">
                {/* Step 1: Settings & Image Upload */}
                <div className={`transition-all duration-500 ${step === 1 && !isManualMode ? "opacity-100" : "hidden"}`}>
                    <div className="flex items-center gap-3 mb-6">
                        <span className="bg-black text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-md">1</span>
                        <span className="text-xl font-bold text-gray-900">名刺をスキャン</span>
                    </div>

                    {/* Settings: Platform & Tone */}
                    <div className="grid grid-cols-2 gap-6 mb-8">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">プラットフォーム</label>
                            <div className="relative">
                                <select
                                    value={platform}
                                    onChange={(e) => setPlatform(e.target.value as any)}
                                    className="w-full p-3.5 bg-white border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-black outline-none appearance-none font-medium"
                                >
                                    <option value="email">メール</option>
                                    <option value="linkedin">LinkedIn / SNS</option>
                                    <option value="slack">Slack / チャット</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">トーン（丁寧さ）</label>
                            <div className="relative">
                                <select
                                    value={tone}
                                    onChange={(e) => setTone(e.target.value as any)}
                                    className="w-full p-3.5 bg-white border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-black outline-none appearance-none font-medium"
                                >
                                    <option value="3">超丁寧 (Lv.3)</option>
                                    <option value="2">丁寧 (Lv.2)</option>
                                    <option value="1">フランク (Lv.1)</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-8">
                        <VoiceInput onContextChange={setContext} />
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <Loader2 className="w-10 h-10 animate-spin text-black" />
                            <p className="text-gray-500 font-medium">スキャン & 生成中...</p>
                        </div>
                    ) : (
                        <ImageUploader onImageSelected={handleImageSelected} />
                    )}

                    {!isLoading && (
                        <div className="text-center mt-6">
                            <p className="text-slate-500 text-sm mb-2">- または -</p>
                            <button
                                onClick={handleSkipToManual}
                                className="text-gray-500 hover:text-black text-sm font-medium underline underline-offset-4 transition-colors"
                            >
                                手動で詳細を入力
                            </button>
                        </div>
                    )}
                </div>

                {/* Step 2: Voice Input & Manual Details */}
                {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
                        {/* Manual Details Accordion */}
                        <div className="mb-10 border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                            <button
                                onClick={() => setIsManualDetailsOpen(!isManualDetailsOpen)}
                                className="w-full flex items-center justify-between p-5 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="bg-black text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">i</span>
                                    <span className="font-bold text-gray-900">連絡先詳細</span>
                                </div>
                                <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                                    {isManualDetailsOpen ? "閉じる" : "編集"}
                                </span>
                            </button>

                            {isManualDetailsOpen && (
                                <div className="p-6 space-y-5 border-t border-gray-200">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">会社名</label>
                                        <input
                                            type="text"
                                            value={manualDetails.company}
                                            onChange={(e) => setManualDetails({ ...manualDetails, company: e.target.value })}
                                            className="w-full p-3.5 bg-white border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">名前</label>
                                        <input
                                            type="text"
                                            value={manualDetails.name}
                                            onChange={(e) => setManualDetails({ ...manualDetails, name: e.target.value })}
                                            className="w-full p-3.5 bg-white border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">メールアドレス</label>
                                        <input
                                            type="email"
                                            value={manualDetails.email}
                                            onChange={(e) => setManualDetails({ ...manualDetails, email: e.target.value })}
                                            className="w-full p-3.5 bg-white border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={isLoading}
                            className="w-full mt-10 py-4 bg-black hover:bg-gray-800 text-white rounded-full font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    生成中...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-6 h-6" />
                                    下書きを生成
                                </>
                            )}
                        </button>
                    </div>
                )}

                {/* Step 3: Preview */}
                {step === 3 && generatedEmail && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="bg-black text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-md">3</span>
                            <span className="text-xl font-bold text-gray-900">確認 & 保存</span>
                        </div>
                        <EmailPreview
                            initialData={generatedEmail}
                            onSave={handleSave}
                            onSaveSuccess={handleSaveSuccess}
                        />

                        <button
                            onClick={() => {
                                setStep(1);
                                setImage(null);
                                setContext("");
                                setGeneratedEmail(null);
                                setIsManualMode(false);
                                setManualDetails({ name: "", company: "", email: "" });
                            }}
                            className="w-full mt-8 py-3 text-gray-400 hover:text-gray-900 text-sm font-medium transition-colors"
                        >
                            最初からやり直す
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
