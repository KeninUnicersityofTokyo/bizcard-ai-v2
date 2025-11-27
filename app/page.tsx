"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus, Search, Mail, User, Building, Loader2 } from "lucide-react";
import { Contact } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { subscribeToContacts, subscribeToContactsByFolder } from "@/lib/db";

function DashboardContent() {
    const searchParams = useSearchParams();
    const folderId = searchParams.get("folderId");
    const { user, loading } = useAuth();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isFetching, setIsFetching] = useState(true);

    useEffect(() => {
        if (loading) return;
        if (!user) {
            setIsFetching(false);
            return;
        }

        let unsubscribe: () => void;

        const handleUpdate = (data: Contact[]) => {
            setContacts(data);
            setIsFetching(false);
        };

        if (folderId) {
            unsubscribe = subscribeToContactsByFolder(user.uid, folderId, handleUpdate);
        } else {
            unsubscribe = subscribeToContacts(user.uid, handleUpdate);
        }

        return () => unsubscribe();
    }, [user, loading, folderId]);

    const filteredContacts = contacts.filter(
        (c) =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.company.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <User className="w-10 h-10 text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to BizCard AI</h2>
                <p className="text-gray-500 max-w-md mb-8">
                    Sign in to start managing your business cards and generating instant email replies.
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            <header className="flex items-center justify-between mb-10">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                    {folderId ? "Folder View" : "BizCard AI (v2)"}
                </h1>
                <Link
                    href="/new"
                    className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-5 py-2.5 rounded-full font-medium transition-all shadow-sm hover:shadow-md"
                >
                    <Plus className="w-5 h-5" />
                    New Contact
                </Link>
            </header>

            {/* Search */}
            <div className="relative mb-8 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search contacts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-gray-900 focus:ring-2 focus:ring-gray-200 outline-none shadow-sm placeholder:text-gray-400 transition-all"
                />
            </div>

            {/* Contact List */}
            {isFetching ? (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {filteredContacts.length === 0 ? (
                        <div className="col-span-full text-center py-20">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <User className="w-8 h-8 text-gray-300" />
                            </div>
                            <p className="text-gray-500 font-medium">No contacts found</p>
                        </div>
                    ) : (
                        filteredContacts.map((contact) => (
                            <Link
                                key={contact.id}
                                href={`/contact/${contact.id}`}
                                className="block p-6 bg-white border border-gray-100 rounded-2xl hover:border-gray-300 hover:shadow-lg transition-all duration-300 group"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-2 text-gray-500 text-sm font-medium bg-gray-50 px-3 py-1 rounded-full">
                                        <Building className="w-3.5 h-3.5" />
                                        <span>{contact.company}</span>
                                    </div>
                                    <span className="text-xs text-gray-400 font-medium">
                                        {new Date(contact.createdAt).toLocaleDateString()}
                                    </span>
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                    {contact.name}
                                </h3>

                                <div className="text-sm text-gray-500 flex items-center gap-2 mb-6">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    {contact.email}
                                </div>

                                <div className="text-xs text-gray-600 line-clamp-2 bg-gray-50 p-4 rounded-xl border border-gray-100 leading-relaxed">
                                    <span className="font-semibold text-gray-900 block mb-1">Subject:</span>
                                    {contact.generatedEmail.subject}
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

export default function Dashboard() {
    return (
        <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="animate-spin text-slate-500" /></div>}>
            <DashboardContent />
        </Suspense>
    );
}
