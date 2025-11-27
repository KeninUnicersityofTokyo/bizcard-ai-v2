"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Folder as FolderIcon, Plus, Trash2, Menu, X, Inbox } from "lucide-react";
import { Folder } from "@/types";
import { getFolders, createFolder, deleteFolder } from "@/lib/storage";

export default function Sidebar() {
    const pathname = usePathname();
    const [folders, setFolders] = useState<Folder[]>([]);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        setFolders(getFolders());
    }, []);

    const handleCreateFolder = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newFolderName.trim()) return;
        const newFolder = createFolder(newFolderName);
        setFolders([...folders, newFolder]);
        setNewFolderName("");
        setIsCreating(false);
    };

    const handleDeleteFolder = (id: string) => {
        if (confirm("フォルダを削除しますか？中の連絡先はInboxに移動します。")) {
            deleteFolder(id);
            setFolders(folders.filter((f) => f.id !== id));
        }
    };

    const NavItem = ({ href, icon: Icon, label, active, onDelete }: any) => (
        <Link
            href={href}
            className={`flex items-center justify-between p-3 rounded-xl mb-1 transition-all duration-200 ${active
                ? "bg-gray-100 text-gray-900 font-semibold"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
            onClick={() => setIsMobileOpen(false)}
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

    return (
        <>
            {/* Mobile Toggle */}
            <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg text-gray-900 border border-gray-200 shadow-sm"
            >
                {isMobileOpen ? <X /> : <Menu />}
            </button>

            {/* Sidebar Container */}
            <aside
                className={`fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-gray-100 transform transition-transform duration-300 lg:translate-x-0 ${isMobileOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="p-6 h-full flex flex-col">
                    <h1 className="text-xl font-bold text-gray-900 mb-10 flex items-center gap-3 tracking-tight">
                        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">
                            <Inbox className="w-5 h-5" />
                        </div>
                        BizCard AI
                    </h1>

                    <nav className="flex-1 overflow-y-auto">
                        <NavItem
                            href="/"
                            icon={Inbox}
                            label="Inbox"
                            active={pathname === "/" || pathname.startsWith("/folder/inbox")}
                        />

                        <div className="mt-10 mb-4 flex items-center justify-between px-3">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Folders
                            </span>
                            <button
                                onClick={() => setIsCreating(true)}
                                className="text-gray-400 hover:text-gray-900 transition-colors p-1 hover:bg-gray-100 rounded"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>

                        {isCreating && (
                            <form onSubmit={handleCreateFolder} className="mb-2 px-2">
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Folder Name"
                                    value={newFolderName}
                                    onChange={(e) => setNewFolderName(e.target.value)}
                                    onBlur={() => !newFolderName && setIsCreating(false)}
                                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all"
                                />
                            </form>
                        )}

                        <div className="space-y-0.5">
                            {folders.map((folder) => (
                                <NavItem
                                    key={folder.id}
                                    href={`/?folderId=${folder.id}`}
                                    icon={FolderIcon}
                                    label={folder.name}
                                    active={pathname.includes(`folderId=${folder.id}`)}
                                    onDelete={() => handleDeleteFolder(folder.id)}
                                />
                            ))}
                        </div>
                    </nav>

                    <div className="pt-6 border-t border-gray-100">
                        <div className="flex items-center gap-3 px-3 py-2">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-bold">
                                U
                            </div>
                            <div className="text-sm font-medium text-gray-700">User Account</div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
