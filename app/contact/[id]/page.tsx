"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Building, User, Calendar, Trash2, Send, Folder as FolderIcon, Mic, MicOff, Sparkles, Loader2, Pencil } from "lucide-react";
import { Contact, Folder } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { getContact, deleteContact, updateContact, getFolders, getContactImage } from "@/lib/db";
import { useAiRefine } from "@/hooks/useAiRefine";

export default function ContactDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { user } = useAuth();
    const [contact, setContact] = useState<Contact | null>(null);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [image, setImage] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        name: "",
        company: "",
        email: "",
        cc: "",
        bcc: "",
        subject: "",
        body: ""
    });

    const { isRecording, isRefining, toggleRecording } = useAiRefine(
        editForm.body,
        (newBody) => setEditForm((prev) => ({ ...prev, body: newBody }))
    );

    useEffect(() => {
        if (!user) return;

        getContact(user.uid, params.id).then((found) => {
            if (found) {
                setContact(found);
                setEditForm({
                    name: found.name,
                    company: found.company,
                    email: found.email,
                    cc: found.generatedEmail.cc || "",
                    bcc: found.generatedEmail.bcc || "",
                    subject: found.generatedEmail.subject,
                    body: found.generatedEmail.body
                });
                // ... (image fetching)
            } else {
                router.push("/");
            }
        });
        getFolders(user.uid).then(setFolders);
    }, [params.id, router, user]);

    // ... (handleDelete, handleMoveFolder)

    const handleOpenMailer = async () => {
        if (!contact || !user) return;

        // Auto-move to Sent folder
        await updateContact(user.uid, params.id, { folderId: "sent" });
        setContact((prev: Contact | null) => prev ? { ...prev, folderId: "sent" } : null);

        const subject = encodeURIComponent(contact.generatedEmail.subject);
        const body = encodeURIComponent(contact.generatedEmail.body);
        const cc = contact.generatedEmail.cc ? `&cc=${encodeURIComponent(contact.generatedEmail.cc)}` : "";
        const bcc = contact.generatedEmail.bcc ? `&bcc=${encodeURIComponent(contact.generatedEmail.bcc)}` : "";

        window.location.href = `mailto:${contact.email}?subject=${subject}&body=${body}${cc}${bcc}`;

        // Navigate to Sent folder with a slight delay to allow mailer to open
        setTimeout(() => {
            router.push("/?folderId=sent");
        }, 500);
    };

    const handleSaveEdit = async () => {
        if (!user || !contact) return;

        const updates = {
            name: editForm.name,
            company: editForm.company,
            email: editForm.email,
            generatedEmail: {
                subject: editForm.subject,
                body: editForm.body,
                cc: editForm.cc,
                bcc: editForm.bcc
            }
        };

        await updateContact(user.uid, params.id, updates);
        setContact({ ...contact, ...updates });
        setIsEditing(false);
    };

    if (!contact) return <div className="p-20 text-center text-gray-400">Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto pb-20">
            {/* ... (Header) ... */}

            <div className="grid gap-8 md:grid-cols-3">
                {/* Main Info */}
                <div className="md:col-span-2 space-y-8">
                    {/* Basic Info Card */}
                    <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm space-y-6">
                        {/* ... (Company, Email, Date) ... */}

                        {/* CC/BCC Fields in Edit Mode */}
                        {isEditing && (
                            <div className="space-y-4 pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-4 text-gray-900">
                                    <span className="text-sm font-bold text-gray-400 w-10">CC</span>
                                    <input
                                        type="text"
                                        value={editForm.cc}
                                        onChange={(e) => setEditForm({ ...editForm, cc: e.target.value })}
                                        className="flex-1 p-2 border border-gray-200 rounded-lg"
                                        placeholder="cc@example.com"
                                    />
                                </div>
                                <div className="flex items-center gap-4 text-gray-900">
                                    <span className="text-sm font-bold text-gray-400 w-10">BCC</span>
                                    <input
                                        type="text"
                                        value={editForm.bcc}
                                        onChange={(e) => setEditForm({ ...editForm, bcc: e.target.value })}
                                        className="flex-1 p-2 border border-gray-200 rounded-lg"
                                        placeholder="bcc@example.com"
                                    />
                                </div>
                            </div>
                        )}

                        {/* ... (Folder Select) ... */}
                    </div>

                    {/* Generated Email Card */}
                    <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Send className="w-5 h-5 text-gray-900" />
                            Generated Draft
                        </h3>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Subject</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editForm.subject}
                                        onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                                        className="w-full p-4 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm font-medium focus:ring-2 focus:ring-black outline-none"
                                    />
                                ) : (
                                    <div className="p-4 bg-gray-50 rounded-xl text-gray-900 text-sm font-medium border border-gray-100">
                                        {contact.generatedEmail.subject}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Body</label>
                                {isEditing ? (
                                    <div className="relative group">
                                        {/* Rainbow Border Effect */}
                                        {isRecording && (
                                            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl opacity-75 blur-sm animate-pulse"></div>
                                        )}

                                        <textarea
                                            value={editForm.body}
                                            onChange={(e) => setEditForm({ ...editForm, body: e.target.value })}
                                            rows={10}
                                            className={`relative w-full p-4 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm leading-relaxed focus:ring-2 focus:ring-black outline-none transition-all duration-300 ${isRecording ? "border-transparent ring-0" : ""
                                                }`}
                                        />
                                        {/* AI Refinement Button */}
                                        <div className="absolute bottom-4 right-4 z-10">
                                            <button
                                                onClick={toggleRecording}
                                                disabled={isRefining}
                                                className={`flex items-center gap-3 px-6 py-3 rounded-full shadow-lg transition-all duration-300 backdrop-blur-md border border-white/20 ${isRecording
                                                    ? "bg-gradient-to-r from-red-500 to-pink-600 text-white scale-105 shadow-red-500/30"
                                                    : isRefining
                                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                        : "bg-white/90 text-gray-700 hover:bg-white hover:scale-105 hover:shadow-xl hover:text-gray-900 shadow-gray-200/50"
                                                    }`}
                                            >
                                                {isRefining ? (
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                ) : isRecording ? (
                                                    <div className="relative">
                                                        <span className="absolute -inset-1 rounded-full bg-white/30 animate-ping"></span>
                                                        <MicOff className="w-5 h-5 relative z-10" />
                                                    </div>
                                                ) : (
                                                    <Sparkles className="w-5 h-5 text-purple-500" />
                                                )}
                                                <span className="text-sm font-semibold tracking-wide">
                                                    {isRefining ? "Refining..." : isRecording ? "Listening..." : "AI Refine"}
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-gray-50 rounded-xl text-gray-900 text-sm leading-relaxed whitespace-pre-wrap border border-gray-100">
                                        {contact.generatedEmail.body}
                                    </div>
                                )}
                            </div>
                            {!isEditing && (
                                <button
                                    onClick={handleOpenMailer}
                                    className="w-full py-3.5 bg-black hover:bg-gray-800 text-white rounded-full font-bold transition-all shadow-md flex items-center justify-center gap-2"
                                >
                                    <Send className="w-4 h-4" />
                                    Open in Mail App
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Info (Image & Context) */}
                <div className="space-y-8">
                    {image ? (
                        <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm p-2">
                            <img
                                src={image}
                                alt="Business Card"
                                className="w-full h-auto object-cover rounded-xl"
                            />
                        </div>
                    ) : (
                        // Placeholder or skeleton if needed, but keeping it clean for now
                        null
                    )}

                    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Context & Notes</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            {contact.context}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
