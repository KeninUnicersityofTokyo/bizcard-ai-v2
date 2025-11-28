"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "@/components/ImageUploader";
import VoiceInput from "@/components/VoiceInput";
import EmailPreview from "@/components/EmailPreview";
import { generateEmail } from "@/actions/generateEmail";
import { extractContactDetails } from "@/actions/extractContactDetails";
import { useAuth } from "@/context/AuthContext";
import { saveContact, getSignature } from "@/lib/db";

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
    const [signature, setSignature] = useState("");
    const [manualDetails, setManualDetails] = useState({ name: "", company: "", email: "" });
    const [isManualMode, setIsManualMode] = useState(false);
    const [isManualDetailsOpen, setIsManualDetailsOpen] = useState(false);
    const [generatedEmail, setGeneratedEmail] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch signature on mount
    useState(() => {
        if (user) {
            getSignature(user.uid).then(sig => {
                if (sig) setSignature(sig);
            });
        }
    });

    const handleImageSelected = async (base64: string) => {
        setImage(base64);
        setError(null);
        setIsLoading(true);

        try {
            // Extract details from image
            const extracted = await extractContactDetails(base64);
            setManualDetails({
                name: extracted.name || "",
                company: extracted.company || "",
                email: extracted.email || ""
            });

            // Move to Step 2 (Settings)
            setStep(2);
            // Open details by default so user sees they can edit
            setIsManualDetailsOpen(true);
        } catch (error: any) {
            console.error("Extraction failed:", error);
            // Still move to step 2, just empty details
            setStep(2);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSkipToManual = () => {
        setIsManualMode(true);
        setStep(2);
        setError(null);
        setIsManualDetailsOpen(true);
    };

    const handleGenerate = async () => {
        if (!image && !isManualMode) return;

        setIsLoading(true);
        setError(null);
        try {
            const result = await generateEmail(
                image,
                context,
                manualDetails, // Always pass manualDetails (it contains extracted or manual info)
                platform,
                tone
            );

            // Append signature if exists
            if (signature) {
                result.body += `\n\n${signature}`;
            }

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
                company: manualDetails.company || "Unknown", // Use verified company name
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
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">New Contact</h1>
            </header>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center font-medium">
                    {error}
                </div>
            )}

            <div className="space-y-8">
                {/* Step 1: Image Upload / Manual Selection */}
                <div className={`transition-all duration-500 ${step === 1 ? "opacity-100" : "hidden"}`}>
                    <div className="flex items-center gap-3 mb-6">
                        <span className="bg-black text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-md">1</span>
                        <span className="text-xl font-bold text-gray-900">Scan Business Card</span>
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <Loader2 className="w-10 h-10 animate-spin text-black" />
                            <p className="text-gray-500 font-medium">Scanning...</p>
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

                {/* Step 2: Settings & Context (and Manual Details if applicable) */}
                {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="bg-black text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-md">2</span>
                            <span className="text-xl font-bold text-gray-900">Configuration</span>
                        </div>

                        {/* Contact Details (Editable) */}
                        <div className="mb-8 p-6 bg-white border border-gray-200 rounded-2xl shadow-sm space-y-5">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-gray-900">Contact Details</h3>
                                <span className="text-xs text-gray-400 font-medium">
                                    {image ? "Scanned" : "Manual Input"}
                                </span>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">会社名</label>
                                <input
                                    type="text"
                                    value={manualDetails.company}
                                    onChange={(e) => setManualDetails({ ...manualDetails, company: e.target.value })}
                                    className="w-full p-3.5 bg-white border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                                    placeholder="会社名を入力"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">名前</label>
                                <input
                                    type="text"
                                    value={manualDetails.name}
                                    onChange={(e) => setManualDetails({ ...manualDetails, name: e.target.value })}
                                    className="w-full p-3.5 bg-white border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                                    placeholder="名前を入力"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">メールアドレス</label>
                                <input
                                    type="email"
                                    value={manualDetails.email}
                                    onChange={(e) => setManualDetails({ ...manualDetails, email: e.target.value })}
                                    className="w-full p-3.5 bg-white border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                                    placeholder="email@example.com"
                                />
                            </div>
                        </div>

                        {/* Settings: Platform & Tone */}
                        <div className="grid grid-cols-2 gap-6 mb-8">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Platform</label>
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
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tone</label>
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

                        {/* Signature Input */}
                        <div className="mb-8">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Signature (署名)</label>
                            <textarea
                                value={signature}
                                onChange={(e) => setSignature(e.target.value)}
                                className="w-full p-3.5 bg-white border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all h-24 resize-none text-sm"
                                placeholder={`例:\n株式会社〇〇\n営業部 山田太郎\nEmail: ...`}
                            />
                        </div>

                        <div className="mb-8">
                            <VoiceInput onContextChange={setContext} />
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={isLoading}
                            className="w-full py-4 bg-black hover:bg-gray-800 text-white rounded-full font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-6 h-6" />
                                    Generate Draft
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
