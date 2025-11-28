"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Folder as FolderIcon, Plus, Trash2, Menu, X, Inbox, Send } from "lucide-react";
import { Folder } from "@/types";
import { getFolders, createFolder, deleteFolder } from "@/lib/db";

import { useAuth } from "@/context/AuthContext";
import { LogOut, User as UserIcon } from "lucide-react";

export default function Sidebar() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { user, signInWithGoogle, signOut } = useAuth();
    const [folders, setFolders] = useState<Folder[]>([]);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        if (user) {
            getFolders(user.uid).then(setFolders);
        } else {
            setFolders([]);
        }
    }, [user]);

    const handleCreateFolder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newFolderName.trim() || !user) return;

        try {
            const newFolder = await createFolder(user.uid, newFolderName);
            setFolders([...folders, newFolder]);
            setNewFolderName("");
            setIsCreating(false);
            setIsCreatingFolder(false);
        } catch (error) {
            console.error("Error creating folder:", error);
        }
    };

    const handleDeleteFolder = async (id: string) => {
        if (!user) return;
        if (confirm("フォルダを削除しますか？中の連絡先はInboxに移動します。")) {
            try {
                await deleteFolder(user.uid, id);
                setFolders(folders.filter((f) => f.id !== id));
            } catch (error) {
                console.error("Error deleting folder:", error);
            }
        }
    };

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-white rounded-lg shadow-md"
            >
                {isMobileOpen ? <X /> : <Menu />}
            </button>

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-40 h-screen w-72 bg-gray-50 border-r border-gray-200 transition-transform duration-300 ease-in-out lg:translate-x-0 ${isMobileOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="h-full flex flex-col p-6">
                    {/* Logo */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold tracking-tight">BizCard AI</h1>
                    </div>

                    {/* New Contact Button */}
                    <Link
                        href="/new"
                        onClick={() => setIsMobileOpen(false)}
                        className="flex items-center justify-center gap-2 w-full bg-black text-white p-3 rounded-xl font-medium mb-8 hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200"
                    >
                        <Plus className="w-5 h-5" />
                        New Contact
                    </Link>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-1 overflow-y-auto">
                        <div className="mb-6">
                            <p className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                Menu
                            </p>
                            <NavItem
                                href="/"
                                icon={LayoutDashboard}
                                label="All Contacts"
                                active={pathname === "/" && !currentFolderId}
                            />
                        </div>

                        <div className="mb-6">
                            <div className="flex items-center justify-between px-3 mb-2">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    Folders
                                </p>
                                <button
                                    onClick={() => setIsCreatingFolder(true)}
                                    className="text-gray-400 hover:text-gray-900 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>

                            <NavItem
                                href="/?folderId=drafts"
                                icon={FolderIcon}
                                label="Drafts"
                                active={currentFolderId === "drafts"}
                            />
                            <NavItem
                                href="/?folderId=sent"
                                icon={Send}
                                label="Sent"
                                active={currentFolderId === "sent"}
                            />

                            {folders.map((folder) => (
                                <NavItem
                                    key={folder.id}
                                    href={`/?folderId=${folder.id}`}
                                    icon={FolderIcon}
                                    label={folder.name}
                                    active={currentFolderId === folder.id}
                                    onDelete={() => handleDeleteFolder(folder.id)}
                                />
                            ))}

                            {isCreatingFolder && (
                                <div className="px-3 py-2">
                                    <input
                                        type="text"
                                        value={newFolderName}
                                        onChange={(e) => setNewFolderName(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") handleCreateFolder();
                                            if (e.key === "Escape") setIsCreatingFolder(false);
                                        }}
                                        placeholder="Folder name..."
                                        autoFocus
                                        className="w-full p-2 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:border-black"
                                    />
                                </div>
                            )}
                        </div>
                    </nav>

                    {/* User Profile & Settings */}
                    <div className="pt-6 border-t border-gray-200 space-y-2">
                        <button
                            onClick={() => setIsSignatureModalOpen(true)}
                            className="flex items-center gap-3 w-full p-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors text-sm font-medium"
                        >
                            <Settings className="w-5 h-5" />
                            Settings
                        </button>

                        {user && (
                            <div className="flex items-center gap-3 px-3 py-2">
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">
                                    {user.email?.[0].toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {user.email}
                                    </p>
                                </div>
                                <button
                                    onClick={() => signOut()}
                                    className="text-gray-400 hover:text-gray-900 transition-colors"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
}
