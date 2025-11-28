"use client";

import { useState, useEffect } from "react";
import { X, Save, Loader2, Globe, PenTool } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { getSignature, saveSignature } from "@/lib/db";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type Tab = "general" | "signature";

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const { user } = useAuth();
    const { language, setLanguage, t } = useLanguage();
    const [activeTab, setActiveTab] = useState<Tab>("general");

    const [signature, setSignature] = useState("");
    const [isLoadingSignature, setIsLoadingSignature] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

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
                    </div>

                    {/* Footer Actions (Only for Signature tab) */}
                    {activeTab === "signature" && (
                        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
                            <button
                                onClick={handleSaveSignature}
                                disabled={isSaving}
                                className="px-4 py-2 bg-black text-white hover:bg-gray-800 rounded-lg font-medium transition-colors flex items-center gap-2"
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {t("common.save")}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
