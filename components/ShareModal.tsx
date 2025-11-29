"use client";

import { useState } from "react";
import { X, Copy, Check, Share2, Globe } from "lucide-react";
import { generateShareLink } from "@/actions/share";
import { Contact } from "@/types";
import { auth } from "@/lib/firebase";

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    contact: Contact;
}

export default function ShareModal({ isOpen, onClose, contact }: ShareModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [shareUrl, setShareUrl] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const handleGenerateLink = async () => {
        if (!auth.currentUser) return;

        setIsLoading(true);
        try {
            const result = await generateShareLink(auth.currentUser.uid, contact);
            if (result.success && result.url) {
                setShareUrl(result.url);
            } else {
                alert("リンクの作成に失敗しました。");
            }
        } catch (e) {
            console.error(e);
            alert("エラーが発生しました。");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        if (shareUrl) {
            navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Share2 className="w-5 h-5" />
                            共有リンクを作成
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <div className="flex items-start gap-3">
                                <Globe className="w-5 h-5 text-blue-600 mt-0.5" />
                                <div>
                                    <h3 className="font-bold text-blue-900 text-sm mb-1">
                                        誰でも閲覧可能になります
                                    </h3>
                                    <p className="text-blue-700 text-xs leading-relaxed">
                                        リンクを知っている人は誰でも、この名刺情報とメール文面を閲覧できるようになります。
                                        個人情報の取り扱いにご注意ください。
                                    </p>
                                </div>
                            </div>
                        </div>

                        {!shareUrl ? (
                            <button
                                onClick={handleGenerateLink}
                                disabled={isLoading}
                                className="w-full py-3 bg-black hover:bg-gray-800 text-white rounded-xl font-bold shadow-lg shadow-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Share2 className="w-4 h-4" />
                                        リンクを発行する
                                    </>
                                )}
                            </button>
                        ) : (
                            <div className="space-y-3">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    共有リンク
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        readOnly
                                        value={shareUrl}
                                        className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-600 focus:outline-none"
                                    />
                                    <button
                                        onClick={handleCopy}
                                        className={`px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${copied
                                                ? "bg-green-500 text-white shadow-green-200"
                                                : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                                            }`}
                                    >
                                        {copied ? (
                                            <>
                                                <Check className="w-4 h-4" />
                                                Copied
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-4 h-4" />
                                                Copy
                                            </>
                                        )}
                                    </button>
                                </div>
                                <p className="text-xs text-center text-gray-400 mt-2">
                                    このリンクは現在の内容のスナップショットです。<br />
                                    後から編集しても、共有先の内容は変わりません。
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
