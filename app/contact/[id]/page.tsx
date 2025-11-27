"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Building, User, Calendar, Trash2, Send, Folder as FolderIcon, Mic, MicOff, Sparkles, Loader2 } from "lucide-react";
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
                    subject: found.generatedEmail.subject,
                    body: found.generatedEmail.body
                });
                // If legacy data has image, use it. Otherwise fetch from subcollection.
                if (found.imageBase64) {
                    setImage(found.imageBase64);
                } else {
                    getContactImage(user.uid, params.id).then(img => {
                        if (img) setImage(img);
                    });
                }
            } else {
                router.push("/");
            }
        });
        getFolders(user.uid).then(setFolders);
    }, [params.id, router, user]);

    const handleDelete = async () => {
        if (!user) return;
        if (confirm("Are you sure you want to delete this contact?")) {
            await deleteContact(user.uid, params.id);
            router.push("/");
        }
    };

    const handleMoveFolder = async (folderId: string) => {
        if (!user) return;
        await updateContact(user.uid, params.id, { folderId });
        setContact((prev: Contact | null) => prev ? { ...prev, folderId } : null);
    };

    const handleOpenMailer = async () => {
        if (!contact || !user) return;

        // Auto-move to Sent folder
        await updateContact(user.uid, params.id, { folderId: "sent" });
        setContact((prev: Contact | null) => prev ? { ...prev, folderId: "sent" } : null);

        const subject = encodeURIComponent(contact.generatedEmail.subject);
        const body = encodeURIComponent(contact.generatedEmail.body);
        window.location.href = `mailto:${contact.email}?subject=${subject}&body=${body}`;

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
                body: editForm.body
            }
        };

        await updateContact(user.uid, params.id, updates);
        setContact({ ...contact, ...updates });
        setIsEditing(false);
    };

    if (!contact) return <div className="p-20 text-center text-gray-400">Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <header className="mb-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2.5 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6 text-gray-900" />
                    </Link>
                    {isEditing ? (
                        <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="text-3xl font-bold text-gray-900 tracking-tight bg-transparent border-b border-gray-300 focus:border-black outline-none"
                        />
                    ) : (
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{contact.name}</h1>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {isEditing ? (
                        <>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="p-2.5 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                className="px-4 py-2.5 bg-black text-white hover:bg-gray-800 rounded-xl transition-colors font-medium flex items-center gap-2"
                            >
                                <Send className="w-4 h-4" />
                                Save
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="p-2.5 text-gray-400 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-colors"
                            >
                                <FolderIcon className="w-5 h-5" /> {/* Reusing icon for edit temporarily or import Edit */}
                            </button>
                            <button
                                onClick={handleDelete}
                                className="p-2.5 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </>
                    )}
                </div>
            </header>

            <div className="grid gap-8 md:grid-cols-3">
                {/* Main Info */}
                <div className="md:col-span-2 space-y-8">
                    {/* Basic Info Card */}
                    <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm space-y-6">
                        <div className="flex items-center gap-4 text-gray-900">
                            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                                <Building className="w-5 h-5 text-gray-500" />
                            </div>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editForm.company}
                                    onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                                    className="flex-1 p-2 border border-gray-200 rounded-lg"
                                    placeholder="Company"
                                />
                            ) : (
                                <span className="text-lg font-medium">{contact.company}</span>
                            )}
                        </div>
                        <div className="flex items-center gap-4 text-gray-900">
                            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                                <Mail className="w-5 h-5 text-gray-500" />
                            </div>
                            {isEditing ? (
                                <input
                                    type="email"
                                    value={editForm.email}
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                    className="flex-1 p-2 border border-gray-200 rounded-lg"
                                    placeholder="Email"
                                />
                            ) : (
                                <span className="text-lg font-medium">{contact.email}</span>
                            )}
                        </div>
                        <div className="flex items-center gap-4 text-gray-500">
                            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-gray-400" />
                            </div>
                            <span className="text-sm font-medium">{new Date(contact.createdAt).toLocaleString()}</span>
                        </div>

                        <div className="pt-6 border-t border-gray-100">
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                                <FolderIcon className="w-4 h-4" />
                                <span>Folder</span>
                            </div>
                            <div className="relative">
                                <select
                                    value={contact.folderId}
                                    onChange={(e) => handleMoveFolder(e.target.value)}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm font-medium outline-none focus:ring-2 focus:ring-gray-200 appearance-none"
                                >
                                    <option value="drafts">Drafts</option>
                                    <option value="sent">Sent</option>
                                    {folders.map((f) => (
                                        <option key={f.id} value={f.id}>
                                            {f.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>
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
