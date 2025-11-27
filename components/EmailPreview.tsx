"use client";

import { useState, useEffect } from "react";
import { Send, Copy, Check, Save, Loader2, Mic, MicOff, Sparkles } from "lucide-react";
import { Folder } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { getFolders } from "@/lib/db";
import { useAiRefine } from "@/hooks/useAiRefine";

interface EmailData {
    email: string;
    name: string;
    subject: string;
    body: string;
}

interface EmailPreviewProps {
    initialData: EmailData;
    onSave: (data: EmailData, folderId: string) => Promise<boolean>;
    onSaveSuccess: (folderId: string) => void;
}

export default function EmailPreview({ initialData, onSave, onSaveSuccess }: EmailPreviewProps) {
    const { user } = useAuth();
    const [data, setData] = useState(initialData);
    const [copied, setCopied] = useState(false);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [selectedFolderId, setSelectedFolderId] = useState("drafts");
    const [isSaving, setIsSaving] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const { isRecording, isRefining, toggleRecording } = useAiRefine(
        data.body,
        (newBody) => setData((prev) => ({ ...prev, body: newBody }))
    );

    useEffect(() => {
        if (user) {
            getFolders(user.uid).then(setFolders);
        }
    }, [user]);

    const handleChange = (field: keyof EmailData, value: string) => {
        setData((prev) => ({ ...prev, [field]: value }));
    };

    const handleCopy = () => {
        const text = `宛先: ${data.email} \n件名: ${data.subject} \n\n${data.body} `;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleOpenMailer = async () => {
        setIsSaving(true);
        try {
            // Save to Sent folder first
            const success = await onSave(data, "sent");

            if (success) {
                // Open Mailer
                const subject = encodeURIComponent(data.subject);
                const body = encodeURIComponent(data.body);
                window.location.href = `mailto:${data.email}?subject = ${subject}& body=${body} `;

                // Navigate (via onSaveSuccess)
                setTimeout(() => {
                    onSaveSuccess("sent");
                }, 500); // Small delay to ensure mailer opens
            }
        } catch (error) {
            console.error("Failed to send:", error);
            setIsSaving(false);
        }
    };

    const handleSaveClick = async () => {
        setIsSaving(true);
        try {
            const success = await onSave(data, selectedFolderId);
            if (success) {
                setIsSuccess(true);
                setTimeout(() => {
                    onSaveSuccess(selectedFolderId);
                }, 1000);
            }
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="w-full max-w-xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden font-sans">
            {/* Header */}
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">New Message</span>
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
                </div>
            </div>

            <div className="p-6 space-y-4">
                {/* To */}
                <div className="flex items-center border-b border-gray-100 pb-2">
                    <span className="text-gray-400 text-sm w-16 font-medium">To</span>
                    <input
                        type="email"
                        value={data.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        className="flex-1 bg-transparent outline-none text-gray-900 text-sm"
                        placeholder="recipient@example.com"
                    />
                </div>

                {/* Subject */}
                <div className="flex items-center border-b border-gray-100 pb-2">
                    <span className="text-gray-400 text-sm w-16 font-medium">Subject</span>
                    <input
                        type="text"
                        value={data.subject}
                        onChange={(e) => handleChange("subject", e.target.value)}
                        className="flex-1 bg-transparent outline-none text-gray-900 font-semibold text-sm"
                        placeholder="Subject"
                    />
                </div>

                {/* Body */}
                <div className="relative">
                    <textarea
                        value={data.body}
                        onChange={(e) => handleChange("body", e.target.value)}
                        className="w-full h-72 py-4 bg-transparent outline-none text-gray-800 text-sm leading-relaxed resize-none"
                        placeholder="Write your message..."
                    />

                    {/* AI Refinement Button */}
                    <div className="absolute bottom-4 right-4 z-10">
                        <button
                            onClick={toggleRecording}
                            disabled={isRefining}
                            className={`flex items - center gap - 2 px - 4 py - 2 rounded - full shadow - lg transition - all ${isRecording
                                    ? "bg-red-500 text-white animate-pulse"
                                    : isRefining
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        : "bg-black text-white hover:bg-gray-800"
                                } `}
                        >
                            {isRefining ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : isRecording ? (
                                <MicOff className="w-4 h-4" />
                            ) : (
                                <Sparkles className="w-4 h-4" />
                            )}
                            <span className="text-xs font-bold">
                                {isRefining ? "Refining..." : isRecording ? "Listening..." : "AI Refine"}
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleOpenMailer}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-sm shadow-sm transition-all flex items-center gap-2"
                    >
                        Send
                        <Send className="w-4 h-4" />
                    </button>
                    <div className="h-6 w-px bg-gray-300 mx-1"></div>
                    <select
                        value={selectedFolderId}
                        onChange={(e) => setSelectedFolderId(e.target.value)}
                        className="p-2 bg-transparent text-sm text-gray-600 font-medium outline-none cursor-pointer hover:text-gray-900"
                    >
                        <option value="drafts">Drafts</option>
                        {folders.map((f) => (
                            <option key={f.id} value={f.id}>
                                {f.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleSaveClick}
                        disabled={isSaving || isSuccess}
                        className={`p - 2 rounded - full transition - all duration - 300 flex items - center gap - 2 ${isSuccess
                                ? "bg-green-100 text-green-700 px-4"
                                : "text-gray-400 hover:text-gray-900 hover:bg-gray-200"
                            } disabled: opacity - 100`}
                        title="Save Draft"
                    >
                        {isSaving ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : isSuccess ? (
                            <>
                                <Check className="w-5 h-5" />
                                <span className="text-sm font-bold">Saved!</span>
                            </>
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                    </button>
                    <button
                        onClick={handleCopy}
                        className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-200 rounded-full transition-colors"
                        title="Copy Text"
                    >
                        {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                    </button>
                </div>
            </div>
        </div>
    );
}
