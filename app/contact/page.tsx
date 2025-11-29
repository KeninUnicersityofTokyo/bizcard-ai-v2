"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import ShareModal from "@/components/ShareModal";
import {
    ArrowLeft,
    Mail,
    Building,
    User,
    Calendar,
    Trash2,
    Send,
    Folder as FolderIcon,
    Mic,
    MicOff,
    Sparkles,
    Loader2,
    Pencil,
    Save,
    X,
    RotateCcw,
    AlertTriangle,
    Share2,
    Copy
} from "lucide-react";
import { Contact, Folder } from "@/types";
import { useAuth } from "@/context/AuthContext";
import {
    getContact,
    deleteContact,
    updateContact,
    getFolders,
    getContactImage,
    permanentlyDeleteContact,
    restoreContact
} from "@/lib/db";
import { useAiRefine } from "@/hooks/useAiRefine";

function ContactDetailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    const { user } = useAuth();
    const [contact, setContact] = useState<Contact | null>(null);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [image, setImage] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
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
        if (!user || !id) return;

        getContact(user.uid, id).then((found) => {
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
                getContactImage(user.uid, id).then(setImage);
            } else {
                router.push("/");
            }
        });
        getFolders(user.uid).then(setFolders);
    }, [id, router, user]);

    const handleDelete = async () => {
        if (!user || !contact || !id) return;

        if (contact.folderId === "trash") {
            if (confirm("この連絡先を完全に削除しますか？この操作は取り消せません。")) {
                setIsDeleting(true);
                await permanentlyDeleteContact(user.uid, contact.id);
                router.push("/?folderId=trash");
            }
        } else {
            if (confirm("この連絡先をゴミ箱に移動しますか？")) {
                setIsDeleting(true);
                await deleteContact(user.uid, contact.id);
                router.push("/");
            }
        }
    };

    const handleRestore = async () => {
        if (!user || !contact || !id) return;
        await restoreContact(user.uid, contact.id);
        const updated = await getContact(user.uid, contact.id);
        setContact(updated);
        router.refresh();
    };

    const handleOpenMailer = async () => {
        if (!contact || !user || !id) return;

        // Auto-move to Sent folder if not already there or in trash
        if (contact.folderId !== "sent" && contact.folderId !== "trash") {
            await updateContact(user.uid, id, { folderId: "sent" });
            setContact((prev: Contact | null) => prev ? { ...prev, folderId: "sent" } : null);
        }

        const subject = encodeURIComponent(contact.generatedEmail.subject);
        const body = encodeURIComponent(contact.generatedEmail.body);
        const cc = contact.generatedEmail.cc ? `&cc=${encodeURIComponent(contact.generatedEmail.cc)}` : "";
        const bcc = contact.generatedEmail.bcc ? `&bcc=${encodeURIComponent(contact.generatedEmail.bcc)}` : "";

        window.location.href = `mailto:${contact.email}?subject=${subject}&body=${body}${cc}${bcc}`;

        // Navigate to Sent folder with a slight delay
        setTimeout(() => {
            router.push("/?folderId=sent");
        }, 500);
    };

    const handleSaveEdit = async () => {
        if (!user || !contact || !id) return;

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

        await updateContact(user.uid, id, updates);
        setContact({ ...contact, ...updates });
        setIsEditing(false);
    };

    if (!id) return null;
    if (!contact) return <div className="p-20 text-center text-gray-400">Loading...</div>;

    const isTrash = contact.folderId === "trash";

    return (
        <div className="max-w-4xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <Link
                    href="/"
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back
                </Link>

                <div className="flex items-center gap-3">
                    {isTrash ? (
                        <>
                            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg text-sm font-medium mr-2">
                                <AlertTriangle className="w-4 h-4" />
                                Deleted
                            </div>
                            <button
                                onClick={handleRestore}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Restore
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-medium text-sm"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete Permanently
                            </button>
                        </>
                    ) : isEditing ? (
                        <>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm"
                            >
                                <X className="w-4 h-4" />
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors font-medium text-sm shadow-sm"
                            >
                                <Save className="w-4 h-4" />
                                Save Changes
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setIsShareModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm"
                            >
                                <Share2 className="w-4 h-4" />
                                Share
                            </button>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm"
                            >
                                <Pencil className="w-4 h-4" />
                                Edit
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-red-600 rounded-xl hover:bg-red-50 hover:border-red-100 transition-colors font-medium text-sm"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
                {/* Main Info */}
                <div className="md:col-span-2 space-y-8">
                    {/* Basic Info Card */}
                    <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm space-y-6">
                        <div className="space-y-4">
                            {/* Name */}
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Name</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:ring-2 focus:ring-black outline-none"
                                    />
                                ) : (
                                    <h1 className="text-3xl font-bold text-gray-900">{contact.name}</h1>
                                )}
                            </div>

                            {/* Company */}
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Company</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editForm.company}
                                        onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:ring-2 focus:ring-black outline-none"
                                    />
                                ) : (
                                    <div className="flex items-center gap-2 text-gray-600 font-medium">
                                        <Building className="w-5 h-5 text-gray-400" />
                                        {contact.company}
                                    </div>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Email</label>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        value={editForm.email}
                                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:ring-2 focus:ring-black outline-none"
                                    />
                                ) : (
                                    <div className="flex items-center gap-2 text-gray-600 font-medium">
                                        <Mail className="w-5 h-5 text-gray-400" />
                                        {contact.email}
                                    </div>
                                )}
                            </div>
                        </div>

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
                            {!isEditing && !isTrash && (
                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={handleOpenMailer}
                                        className="w-full py-3.5 bg-black hover:bg-gray-800 text-white rounded-full font-bold transition-all shadow-md flex items-center justify-center gap-2"
                                    >
                                        <Send className="w-4 h-4" />
                                        Open in Mail App
                                    </button>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(contact.generatedEmail.body);
                                            alert("本文をコピーしました！");
                                        }}
                                        className="w-full py-3.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-full font-bold transition-all flex items-center justify-center gap-2"
                                    >
                                        <Copy className="w-4 h-4" />
                                        Copy Body Text
                                    </button>
                                </div>
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

            <ShareModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                contact={contact}
            />
        </div>
    );
}

export default function ContactDetailPage() {
    return (
        <Suspense fallback={<div className="p-20 text-center text-gray-400">Loading...</div>}>
            <ContactDetailContent />
        </Suspense>
    );
}
