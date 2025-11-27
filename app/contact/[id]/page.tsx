"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Building, User, Calendar, Trash2, Send, Folder as FolderIcon } from "lucide-react";
import { Contact, Folder } from "@/types";
import { getContacts, deleteContact, updateContact, getFolders } from "@/lib/storage";

export default function ContactDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [contact, setContact] = useState<Contact | null>(null);
    const [folders, setFolders] = useState<Folder[]>([]);

    useEffect(() => {
        const contacts = getContacts();
        const found = contacts.find((c) => c.id === params.id);
        if (found) {
            setContact(found);
        } else {
            router.push("/");
        }
        setFolders(getFolders());
    }, [params.id, router]);

    const handleDelete = () => {
        if (confirm("Are you sure you want to delete this contact?")) {
            deleteContact(params.id);
            router.push("/");
        }
    };

    const handleMoveFolder = (folderId: string) => {
        updateContact(params.id, { folderId });
        setContact((prev: Contact | null) => prev ? { ...prev, folderId } : null);
    };

    const handleOpenMailer = () => {
        if (!contact) return;
        const subject = encodeURIComponent(contact.generatedEmail.subject);
        const body = encodeURIComponent(contact.generatedEmail.body);
        window.location.href = `mailto:${contact.email}?subject=${subject}&body=${body}`;
    };

    if (!contact) return <div className="p-20 text-center text-gray-400">Loading...</div>;

    const currentFolder = folders.find(f => f.id === contact.folderId)?.name || "Inbox";

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <header className="mb-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2.5 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6 text-gray-900" />
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{contact.name}</h1>
                </div>
                <button
                    onClick={handleDelete}
                    className="p-2.5 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
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
                            <span className="text-lg font-medium">{contact.company}</span>
                        </div>
                        <div className="flex items-center gap-4 text-gray-900">
                            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                                <Mail className="w-5 h-5 text-gray-500" />
                            </div>
                            <span className="text-lg font-medium">{contact.email}</span>
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
                                    <option value="inbox">Inbox</option>
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
                                <div className="p-4 bg-gray-50 rounded-xl text-gray-900 text-sm font-medium border border-gray-100">
                                    {contact.generatedEmail.subject}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Body</label>
                                <div className="p-4 bg-gray-50 rounded-xl text-gray-900 text-sm leading-relaxed whitespace-pre-wrap border border-gray-100">
                                    {contact.generatedEmail.body}
                                </div>
                            </div>
                            <button
                                onClick={handleOpenMailer}
                                className="w-full py-3.5 bg-black hover:bg-gray-800 text-white rounded-full font-bold transition-all shadow-md flex items-center justify-center gap-2"
                            >
                                <Send className="w-4 h-4" />
                                Open in Mail App
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info (Image & Context) */}
                <div className="space-y-8">
                    {contact.imageBase64 && (
                        <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm p-2">
                            <img
                                src={contact.imageBase64}
                                alt="Business Card"
                                className="w-full h-auto object-cover rounded-xl"
                            />
                        </div>
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
