"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
    LayoutDashboard,
    Plus,
    LogOut,
    Menu,
    X,
    Folder as FolderIcon,
    Trash2,
    Send,
    Settings
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Folder } from "@/types";
import { createFolder, deleteFolder, getFolders } from "@/lib/db";
import SignatureModal from "./SignatureModal";

const NavItem = ({ href, icon: Icon, label, active, onDelete, onClick }: any) => (
    <Link
        href={href}
        className={`flex items-center justify-between p-3 rounded-xl mb-1 transition-all duration-200 ${active
            ? "bg-gray-100 text-gray-900 font-semibold"
            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            }`}
        onClick={onClick}
    >
        <div className="flex items-center gap-3">
            <Icon className={`w-5 h-5 ${active ? "text-gray-900" : "text-gray-400"}`} />
            <span className="text-sm">{label}</span>
        </div>
        {onDelete && (
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete();
                }}
                className="p-1.5 text-gray-400 hover:bg-gray-200 hover:text-red-600 rounded-lg transition-colors"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        )}
    </Link>
);

function SidebarContent() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentFolderId = searchParams.get("folderId");
    const { user, signOut } = useAuth();
    const [folders, setFolders] = useState<Folder[]>([]);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);

    useEffect(() => {
        if (user) {
            getFolders(user.uid).then(setFolders);
        }
    }, [user]);

    const handleCreateFolder = async () => {
        if (!user || !newFolderName.trim()) return;
        try {
            const newFolder = await createFolder(user.uid, newFolderName);
            setFolders([...folders, newFolder]);
            setNewFolderName("");
            setIsCreatingFolder(false);
        } catch (error) {
            console.error("Error creating folder:", error);
        }
    };

    const handleDeleteFolder = async (folderId: string) => {
        if (!user) return;
        if (confirm("Are you sure you want to delete this folder?")) {
            try {
                await deleteFolder(user.uid, folderId);
                setFolders(folders.filter((f) => f.id !== folderId));
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
                    <div className="mb-8 flex items-center gap-3">
                        <img src="/logo.png" alt="BizCard AI Logo" className="w-8 h-8 object-contain" />
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
                                onClick={() => setIsMobileOpen(false)}
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
                                onClick={() => setIsMobileOpen(false)}
                            />
                            <NavItem
                                href="/?folderId=sent"
                                icon={Send}
                                label="Sent"
                                active={currentFolderId === "sent"}
                                onClick={() => setIsMobileOpen(false)}
                            />
                            <NavItem
                                href="/?folderId=trash"
                                icon={Trash2}
                                label="Trash"
                                active={currentFolderId === "trash"}
                                onClick={() => setIsMobileOpen(false)}
                            />

                            {folders.map((folder) => (
                                <NavItem
                                    key={folder.id}
                                    href={`/?folderId=${folder.id}`}
                                    icon={FolderIcon}
                                    label={folder.name}
                                    active={currentFolderId === folder.id}
                                    onDelete={() => handleDeleteFolder(folder.id)}
                                    onClick={() => setIsMobileOpen(false)}
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

            <SignatureModal
                isOpen={isSignatureModalOpen}
                onClose={() => setIsSignatureModalOpen(false)}
            />
        </>
    );
}

export default function Sidebar() {
    return (
        <Suspense fallback={<div className="w-72 bg-gray-50 border-r border-gray-200 hidden lg:block" />}>
            <SidebarContent />
        </Suspense>
    );
}
