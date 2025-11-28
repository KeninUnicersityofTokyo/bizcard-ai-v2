"use client";

import { useState, useEffect } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getSignature, saveSignature } from "@/lib/db";

interface SignatureModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SignatureModal({ isOpen, onClose }: SignatureModalProps) {
    const { user } = useAuth();
    const [signature, setSignature] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen && user) {
            setIsLoading(true);
            getSignature(user.uid)
                .then(setSignature)
                .finally(() => setIsLoading(false));
        }
    }, [isOpen, user]);

    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            await saveSignature(user.uid, signature);
            onClose();
        } catch (error) {
            console.error("Failed to save signature:", error);
            alert("署名の保存に失敗しました。");
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900">Edit Signature</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-500">
                                This signature will be automatically appended to your generated emails.
                            </p>
                            <textarea
                                value={signature}
                                onChange={(e) => setSignature(e.target.value)}
                                className="w-full h-48 p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-black outline-none resize-none"
                                placeholder={`Example:\n\n--\nJohn Doe\nSales Manager\nAcme Corp\nTel: 03-1234-5678\nEmail: john@example.com`}
                            />
                        </div>
                    )}
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-4 py-2 bg-black text-white hover:bg-gray-800 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Signature
                    </button>
                </div>
            </div>
        </div>
    );
}
