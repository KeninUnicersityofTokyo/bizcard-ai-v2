"use client";

import { useState, useEffect } from "react";
import { X, Save, Loader2, Globe, PenTool, Key } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { getSignature, saveSignature } from "@/lib/db";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type Tab = "general" | "signature" | "apikey";

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const { user } = useAuth();
    const { language, setLanguage, t } = useLanguage();
    const [activeTab, setActiveTab] = useState<Tab>("general");

    const [apiKey, setApiKey] = useState("");
    const [showApiKey, setShowApiKey] = useState(false);

    const [signature, setSignature] = useState("");
    const [isLoadingSignature, setIsLoadingSignature] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Load API Key from localStorage
            const storedKey = localStorage.getItem("gemini_api_key");
            if (storedKey) setApiKey(storedKey);
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && user && activeTab === "signature") {
            setIsLoadingSignature(true);
            getSignature(user.uid)
                .then(setSignature)
                .finally(() => setIsLoadingSignature(false));
        }
    }, [isOpen, user, activeTab]);

    const handleSaveSignature = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            await saveSignature(user.uid, signature);
            // Optional: Show success message
        } catch (error) {
            console.error("Failed to save signature:", error);
            alert(t("common.error"));
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveApiKey = () => {
        localStorage.setItem("gemini_api_key", apiKey.trim());
        alert("APIキーを保存しました。");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col md:flex-row h-[600px] md:h-[500px]">

                {/* Sidebar / Tabs */}
                <div className="w-full md:w-64 bg-gray-50 border-b md:border-b-0 md:border-r border-gray-200 p-4 flex flex-col">
                    <div className="mb-6 hidden md:block">
                        <h2 className="text-lg font-bold text-gray-900">{t("settings.title")}</h2>
                    </div>

                    <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible">
                        <button
                            onClick={() => setActiveTab("general")}
                            className={`flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${activeTab === "general"
                                ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200"
                                : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                                }`}
                        >
                            <Globe className="w-4 h-4" />
                            {t("settings.general")}
                        </button>
                        <button
                            onClick={() => setActiveTab("signature")}
                            className={`flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${activeTab === "signature"
                                ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200"
                                : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                                }`}
                        >
                            <PenTool className="w-4 h-4" />
                            {t("settings.signature")}
                        </button>
                        <button
                            onClick={() => setActiveTab("apikey")}
                            className={`flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${activeTab === "apikey"
                                ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200"
                                : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                                }`}
                        >
                            <Key className="w-4 h-4" />
                            API Key
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 flex flex-col h-full overflow-hidden">
                    {/* Header (Mobile only close button, Desktop header is in sidebar) */}
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center md:justify-end">
                        <h2 className="text-lg font-bold text-gray-900 md:hidden">{t("settings.title")}</h2>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"
                            aria-label="Close settings"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        {activeTab === "general" && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-base font-bold text-gray-900 mb-1">{t("settings.language")}</h3>
                                    <p className="text-sm text-gray-500 mb-4">{t("settings.languageDesc")}</p>

                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => setLanguage("ja")}
                                            className={`p-4 rounded-xl border-2 text-left transition-all ${language === "ja"
                                                ? "border-black bg-gray-50"
                                                : "border-gray-200 hover:border-gray-300"
                                                }`}
                                        >
                                            <span className="block font-bold text-gray-900">日本語</span>
                                            <span className="text-xs text-gray-500">Japanese</span>
                                        </button>
                                        <button
                                            onClick={() => setLanguage("en")}
                                            className={`p-4 rounded-xl border-2 text-left transition-all ${language === "en"
                                                ? "border-black bg-gray-50"
                                                : "border-gray-200 hover:border-gray-300"
                                                }`}
                                        >
                                            <span className="block font-bold text-gray-900">English</span>
                                            <span className="text-xs text-gray-500">English</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "signature" && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-base font-bold text-gray-900 mb-1">{t("settings.signature")}</h3>
                                    <p className="text-sm text-gray-500 mb-4">{t("settings.signatureDesc")}</p>

                                    {isLoadingSignature ? (
                                        <div className="flex justify-center py-8">
                                            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                                        </div>
                                    ) : (
                                        <textarea
                                            value={signature}
                                            onChange={(e) => setSignature(e.target.value)}
                                            className="w-full h-64 p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-black outline-none resize-none font-mono"
                                            placeholder={t("settings.signatureExample")}
                                        />
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === "apikey" && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-base font-bold text-gray-900 mb-1">Gemini API Key</h3>
                                    <p className="text-sm text-gray-500 mb-4">
                                        AI生成機能を使用するには、ご自身のGoogle Gemini APIキーが必要です。
                                        キーはブラウザ内にのみ保存され、サーバーには保存されません。
                                    </p>

                                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
                                        <p className="text-sm text-blue-800 font-medium mb-2">APIキーの取得方法:</p>
                                        <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1 ml-1">
                                            <li>
                                                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-900">
                                                    Google AI Studio
                                                </a>
                                                にアクセス
                                            </li>
                                            <li>「Create API key」をクリック</li>
                                            <li>生成されたキーをコピーして下に貼り付け</li>
                                        </ol>
                                    </div>

                                    <div className="relative">
                                        <input
                                            type={showApiKey ? "text" : "password"}
                                            value={apiKey}
                                            onChange={(e) => setApiKey(e.target.value)}
                                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-mono text-sm focus:ring-2 focus:ring-black outline-none pr-12"
                                            placeholder="AIzaSy..."
                                        />
                                        <button
                                            onClick={() => setShowApiKey(!showApiKey)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showApiKey ? (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
                        {activeTab === "signature" && (
                            <button
                                onClick={handleSaveSignature}
                                disabled={isSaving}
                                className="px-4 py-2 bg-black text-white hover:bg-gray-800 rounded-lg font-medium transition-colors flex items-center gap-2"
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {t("common.save")}
                            </button>
                        )}
                        {activeTab === "apikey" && (
                            <button
                                onClick={handleSaveApiKey}
                                className="px-4 py-2 bg-black text-white hover:bg-gray-800 rounded-lg font-medium transition-colors flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                {t("common.save")}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
