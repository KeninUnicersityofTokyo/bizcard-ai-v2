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

import { Loader2, Sparkles, ArrowLeft, AlertTriangle, RefreshCw, PenTool } from "lucide-react";
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
    const [scanError, setScanError] = useState<"TOTAL_FAILURE" | "PARTIAL_FAILURE" | null>(null);

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
        setScanError(null);
        setIsLoading(true);

        try {
            // Get API Key
            const apiKey = localStorage.getItem("gemini_api_key") || undefined;

            // Extract details from image
            const extracted = await extractContactDetails(base64, apiKey);

            const isTotalFailure = !extracted.name && !extracted.company && !extracted.email;
            const isPartialFailure = !extracted.name || !extracted.company || !extracted.email;

            if (isTotalFailure) {
                setScanError("TOTAL_FAILURE");
                // Do NOT move to step 2
                setIsLoading(false);
                return;
            }

            setManualDetails({
                name: extracted.name || "",
                company: extracted.company || "",
                email: extracted.email || ""
            });

            if (isPartialFailure) {
                setScanError("PARTIAL_FAILURE");
            }

            // Move to Step 2 (Settings)
            setStep(2);
            // Open details by default so user sees they can edit
            setIsManualDetailsOpen(true);
        } catch (error: any) {
            console.error("Extraction failed:", error);
            if (error.message?.includes("APIキー")) {
                alert("APIキーが設定されていません。左上の設定メニューからAPIキーを保存してください。");
                setError("APIキーが設定されていません。設定メニューから保存してください。");
            } else {
                setScanError("TOTAL_FAILURE");
            }
            // Stay on step 1
        } finally {
            setIsLoading(false);
        }
    };

    const handleSkipToManual = () => {
        setIsManualMode(true);
        setScanError(null);
        setStep(2);
        setError(null);
        setIsManualDetailsOpen(true);
    };

    const handleGenerate = async () => {
        if (!image && !isManualMode) return;

        setIsLoading(true);
        setError(null);
        try {
            // Get API Key
            const apiKey = localStorage.getItem("gemini_api_key") || undefined;

            const result = await generateEmail(
                image,
                context,
                manualDetails, // Always pass manualDetails (it contains extracted or manual info)
                platform,
                tone,
                apiKey
            );

            // Append signature if exists
            if (signature) {
                result.body += `\n\n${signature}`;
            }

            setGeneratedEmail(result);
            setStep(3);
        } catch (error: any) {
            console.error(error);
            if (error.message?.includes("APIキー")) {
                alert("APIキーが設定されていません。左上の設定メニューからAPIキーを保存してください。");
                setError("APIキーが設定されていません。設定メニューから保存してください。");
            } else {
                setError(error.message || "予期せぬエラーが発生しました。");
            }
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

                    {/* Total Failure Alert */}
                    {scanError === "TOTAL_FAILURE" && !isLoading && (
                        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-center gap-3 mb-3 text-red-700 font-bold">
                                <AlertTriangle className="w-5 h-5" />
                                <span>認識できませんでした</span>
                            </div>
                            <p className="text-sm text-red-600 mb-4">
                                名刺の文字を読み取れませんでした。画像が鮮明か確認して再試行するか、手動で入力してください。
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setScanError(null);
                                        setImage(null);
                                    }}
                                    className="flex-1 py-2.5 bg-white border border-red-200 text-red-700 rounded-lg text-sm font-bold hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    もう一度スキャン
                                </button>
                                <button
                                    onClick={handleSkipToManual}
                                    className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <PenTool className="w-4 h-4" />
                                    手動で入力
                                </button>
                            </div>
                        </div>
                    )}

                    {!isLoading && scanError !== "TOTAL_FAILURE" && (
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

                        {/* Partial Failure Alert */}
                        {scanError === "PARTIAL_FAILURE" && (
                            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                                <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold text-yellow-800 text-sm">一部読み取れなかった可能性があります</p>
                                    <p className="text-xs text-yellow-700 mt-1">
                                        赤枠の項目を確認し、必要に応じて修正してください。
                                    </p>
                                </div>
                            </div>
                        )}

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
                                    className={`w-full p-3.5 bg-white border rounded-xl text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all ${scanError === "PARTIAL_FAILURE" && !manualDetails.company
                                        ? "border-red-300 bg-red-50 focus:bg-white"
                                        : "border-gray-300"
                                        }`}
                                    placeholder="会社名を入力"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">名前</label>
                                <input
                                    type="text"
                                    value={manualDetails.name}
                                    onChange={(e) => setManualDetails({ ...manualDetails, name: e.target.value })}
                                    className={`w-full p-3.5 bg-white border rounded-xl text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all ${scanError === "PARTIAL_FAILURE" && !manualDetails.name
                                        ? "border-red-300 bg-red-50 focus:bg-white"
                                        : "border-gray-300"
                                        }`}
                                    placeholder="名前を入力"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">メールアドレス</label>
                                <input
                                    type="email"
                                    value={manualDetails.email}
                                    onChange={(e) => setManualDetails({ ...manualDetails, email: e.target.value })}
                                    className={`w-full p-3.5 bg-white border rounded-xl text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all ${scanError === "PARTIAL_FAILURE" && !manualDetails.email
                                        ? "border-red-300 bg-red-50 focus:bg-white"
                                        : "border-gray-300"
                                        }`}
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
