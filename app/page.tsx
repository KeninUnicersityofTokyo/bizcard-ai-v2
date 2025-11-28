"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
    Plus,
    Search,
    Mail,
    User,
    Building,
    Loader2,
    Trash2,
    Pencil,
    FolderInput,
    CheckSquare,
    Square,
    X,
    RotateCcw
} from "lucide-react";
import { Contact, Folder } from "@/types";
import { useAuth } from "@/context/AuthContext";
import {
    getContacts,
    getContactsByFolder,
    subscribeToContacts,
    subscribeToContactsByFolder,
    deleteContact,
    updateContact,
    getFolders,
    permanentlyDeleteContact,
    restoreContact,
    cleanupTrash
} from "@/lib/db";
import LandingPage from "@/components/LandingPage";

function DashboardContent() {
    const searchParams = useSearchParams();
    const folderId = searchParams.get("folderId");
    const { user, loading } = useAuth();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isFetching, setIsFetching] = useState(true);
    const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
    const [isMoving, setIsMoving] = useState(false);
    const [targetFolderId, setTargetFolderId] = useState("");

    const isTrash = folderId === "trash";

    useEffect(() => {
        if (loading) return;
        if (!user) {
            setIsFetching(false);
            return;
        }

        // Fetch folders for "Move to" functionality
        getFolders(user.uid).then(setFolders);

        // Auto-cleanup trash if in trash folder
        if (isTrash) {
            cleanupTrash(user.uid).catch(console.error);
        }

        let unsubscribe: () => void;

        const handleUpdate = (data: Contact[]) => {
            setContacts(data);
            setIsFetching(false);
        };

        if (folderId) {
            unsubscribe = subscribeToContactsByFolder(user.uid, folderId, handleUpdate);
        } else {
            // If not in a specific folder, show all non-trash contacts? 
            // Or show all? Usually "All Contacts" excludes Trash.
            // Let's filter out trash from "All Contacts" view if folderId is null.
            // But subscribeToContacts returns all. We might need to filter client-side or update query.
            // For now, let's filter client-side in handleUpdate or use a different query.
            // Let's stick to client-side filtering for simplicity if the list isn't huge.
            unsubscribe = subscribeToContacts(user.uid, (data) => {
                // Filter out trash from main view
                const nonTrash = data.filter(c => c.folderId !== "trash");
                handleUpdate(nonTrash);
            });
        }

        return () => unsubscribe();
    }, [user, loading, folderId, isTrash]);

    // Clear selection when folder or search changes
    useEffect(() => {
        setSelectedContacts(new Set());
    }, [folderId, searchTerm]);

    const filteredContacts = contacts.filter(
        (c) =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleSelect = (id: string) => {
        const newSelected = new Set(selectedContacts);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedContacts(newSelected);
    };

    const toggleSelectAll = () => {
        if (selectedContacts.size === filteredContacts.length) {
            setSelectedContacts(new Set());
        } else {
            setSelectedContacts(new Set(filteredContacts.map(c => c.id)));
        }
    };

    const handleDelete = async (id: string) => {
        if (!user) return;

        if (isTrash) {
            if (confirm("この連絡先を完全に削除しますか？この操作は取り消せません。")) {
                await permanentlyDeleteContact(user.uid, id);
                removeFromSelection(id);
            }
        } else {
            if (confirm("この連絡先をゴミ箱に移動しますか？")) {
                await deleteContact(user.uid, id);
                removeFromSelection(id);
            }
        }
    };

    const handleRestore = async (id: string) => {
        if (!user) return;
        await restoreContact(user.uid, id);
        removeFromSelection(id);
    };

    const removeFromSelection = (id: string) => {
        if (selectedContacts.has(id)) {
            const newSelected = new Set(selectedContacts);
            newSelected.delete(id);
            setSelectedContacts(newSelected);
        }
    };

    const handleBulkDelete = async () => {
        if (!user) return;
        const message = isTrash
            ? `選択した ${selectedContacts.size} 件の連絡先を完全に削除しますか？`
            : `選択した ${selectedContacts.size} 件の連絡先をゴミ箱に移動しますか？`;

        if (confirm(message)) {
            for (const id of Array.from(selectedContacts)) {
                if (isTrash) {
                    await permanentlyDeleteContact(user.uid, id);
                } else {
                    await deleteContact(user.uid, id);
                }
            }
            setSelectedContacts(new Set());
        }
    };

    const handleBulkRestore = async () => {
        if (!user) return;
        for (const id of Array.from(selectedContacts)) {
            await restoreContact(user.uid, id);
        }
        setSelectedContacts(new Set());
    };

    const handleBulkMove = async () => {
        if (!user || !targetFolderId) return;
        setIsMoving(true);
        try {
            for (const id of Array.from(selectedContacts)) {
                await updateContact(user.uid, id, { folderId: targetFolderId });
            }
            setSelectedContacts(new Set());
            setTargetFolderId("");
        } catch (error) {
            console.error("Error moving contacts:", error);
            alert("連絡先の移動に失敗しました。");
        } finally {
            setIsMoving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (!user) {
        return <LandingPage />;
    }

    return (
        <div className="max-w-7xl mx-auto relative pb-24">
            {/* ... existing authenticated content ... */}
            <header className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        {isTrash ? "Trash" : (folderId ? (folders.find(f => f.id === folderId)?.name || "Folder View") : "All Contacts")}
                    </h1>
                    <span className="text-gray-400 text-sm font-medium bg-gray-50 px-3 py-1 rounded-full">
                        {filteredContacts.length}
                    </span>
                </div>
                {!isTrash && (
                    <Link
                        href="/new"
                        className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-5 py-2.5 rounded-full font-medium transition-all shadow-sm hover:shadow-md"
                    >
                        <Plus className="w-5 h-5" />
                        New Contact
                    </Link>
                )}
            </header>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-between items-start sm:items-center">
                {/* Search */}
                <div className="relative w-full sm:max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search contacts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-black/5 outline-none shadow-sm placeholder:text-gray-400 transition-all"
                    />
                </div>

                {/* Select All Toggle */}
                {filteredContacts.length > 0 && (
                    <button
                        onClick={toggleSelectAll}
                        className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-2"
                    >
                        {selectedContacts.size === filteredContacts.length && filteredContacts.length > 0 ? (
                            <CheckSquare className="w-5 h-5" />
                        ) : (
                            <Square className="w-5 h-5" />
                        )}
                        Select All
                    </button>
                )}
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
                                {isTrash ? <Trash2 className="w-8 h-8 text-gray-300" /> : <User className="w-8 h-8 text-gray-300" />}
                            </div>
                            <p className="text-gray-500 font-medium">{isTrash ? "ゴミ箱は空です" : "連絡先が見つかりません"}</p>
                        </div>
                    ) : (
                        filteredContacts.map((contact) => (
                            <div
                                key={contact.id}
                                className={`relative group block bg-white border rounded-2xl transition-all duration-300 ${selectedContacts.has(contact.id)
                                    ? "border-blue-500 shadow-md ring-1 ring-blue-500"
                                    : "border-gray-100 hover:border-gray-300 hover:shadow-lg"
                                    }`}
                            >
                                {/* Selection Checkbox */}
                                <div className="absolute top-4 left-4 z-10">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleSelect(contact.id);
                                        }}
                                        className={`p-1 rounded-md transition-colors ${selectedContacts.has(contact.id)
                                            ? "text-blue-600 bg-blue-50"
                                            : "text-gray-300 hover:text-gray-500 bg-white/80 backdrop-blur-sm"
                                            }`}
                                    >
                                        {selectedContacts.has(contact.id) ? (
                                            <CheckSquare className="w-5 h-5" />
                                        ) : (
                                            <Square className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>

                                {/* Action Buttons */}
                                <div className="absolute top-4 right-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {isTrash ? (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRestore(contact.id);
                                            }}
                                            className="p-2 bg-white text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg shadow-sm border border-gray-100 transition-colors"
                                            title="Restore"
                                        >
                                            <RotateCcw className="w-4 h-4" />
                                        </button>
                                    ) : (
                                        <Link
                                            href={`/contact/${contact.id}`}
                                            className="p-2 bg-white text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg shadow-sm border border-gray-100 transition-colors"
                                            title="Edit"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </Link>
                                    )}

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(contact.id);
                                        }}
                                        className="p-2 bg-white text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg shadow-sm border border-gray-100 transition-colors"
                                        title={isTrash ? "Delete Permanently" : "Delete"}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Card Content (Clickable Link) */}
                                <Link href={`/contact/${contact.id}`} className="block p-6 pt-12">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-2 text-gray-500 text-sm font-medium bg-gray-50 px-3 py-1 rounded-full">
                                            <Building className="w-3.5 h-3.5" />
                                            <span className="truncate max-w-[150px]">{contact.company}</span>
                                        </div>
                                        <span className="text-xs text-gray-400 font-medium whitespace-nowrap ml-2">
                                            {new Date(contact.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors truncate">
                                        {contact.name}
                                    </h3>

                                    <div className="text-sm text-gray-500 flex items-center gap-2 mb-6 truncate">
                                        <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                        <span className="truncate">{contact.email}</span>
                                    </div>

                                    <div className="text-xs text-gray-600 line-clamp-2 bg-gray-50 p-4 rounded-xl border border-gray-100 leading-relaxed h-20">
                                        <span className="font-semibold text-gray-900 block mb-1">Subject:</span>
                                        {contact.generatedEmail.subject}
                                    </div>
                                </Link>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Bulk Actions Floating Bar */}
            {selectedContacts.size > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white text-gray-900 px-6 py-4 rounded-2xl shadow-xl border border-gray-200 flex items-center gap-6 animate-in slide-in-from-bottom-4 duration-300 w-[90%] max-w-2xl">
                    <div className="flex items-center gap-3 pr-6 border-r border-gray-200">
                        <span className="bg-black text-white text-xs font-bold px-2 py-1 rounded-md">
                            {selectedContacts.size}
                        </span>
                        <span className="text-sm font-medium text-gray-600">Selected</span>
                    </div>

                    <div className="flex items-center gap-4 flex-1">
                        {isTrash ? (
                            <button
                                onClick={handleBulkRestore}
                                className="bg-black text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-gray-800 transition-colors whitespace-nowrap flex items-center gap-2"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Restore
                            </button>
                        ) : (
                            <div className="relative flex-1">
                                <select
                                    value={targetFolderId}
                                    onChange={(e) => setTargetFolderId(e.target.value)}
                                    className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl px-4 py-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-black/5 cursor-pointer hover:bg-gray-100 transition-colors"
                                >
                                    <option value="">Move to folder...</option>
                                    <option value="drafts">Drafts</option>
                                    <option value="sent">Sent</option>
                                    {folders.map(f => (
                                        <option key={f.id} value={f.id}>{f.name}</option>
                                    ))}
                                </select>
                                <FolderInput className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        )}

                        {!isTrash && targetFolderId && (
                            <button
                                onClick={handleBulkMove}
                                disabled={isMoving}
                                className="bg-black text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 whitespace-nowrap"
                            >
                                {isMoving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Move"}
                            </button>
                        )}
                    </div>

                    <div className="pl-6 border-l border-gray-200">
                        <button
                            onClick={handleBulkDelete}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-xl transition-colors flex items-center gap-2 text-sm font-medium"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span className="hidden sm:inline">{isTrash ? "Delete Permanently" : "Delete"}</span>
                        </button>
                    </div>

                    <button
                        onClick={() => setSelectedContacts(new Set())}
                        className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md border border-gray-100 text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-4 h-4" />
                    </button>
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
