import { Contact, Folder } from "@/types";

const STORAGE_KEYS = {
    FOLDERS: "bizcard_folders",
    CONTACTS: "bizcard_contacts",
};

// Helper to generate UUIDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// --- Folders ---

export const getFolders = (): Folder[] => {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem(STORAGE_KEYS.FOLDERS);
    const folders = data ? JSON.parse(data) : [];
    // Ensure 'default' folder exists conceptually, but we might not store it explicitly
    // or we can just return it if list is empty? 
    // Let's stick to user-created folders here.
    return folders;
};

export const createFolder = (name: string): Folder => {
    const folders = getFolders();
    const newFolder: Folder = {
        id: generateId(),
        name,
        createdAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify([...folders, newFolder]));
    return newFolder;
};

export const deleteFolder = (id: string) => {
    const folders = getFolders();
    const newFolders = folders.filter((f) => f.id !== id);
    localStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(newFolders));

    // Move contacts in this folder to 'default' or delete them?
    // Let's move them to 'default' (empty string or 'inbox')
    const contacts = getContacts();
    const updatedContacts = contacts.map(c => c.folderId === id ? { ...c, folderId: 'inbox' } : c);
    localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(updatedContacts));
};

// --- Contacts ---

export const getContacts = (): Contact[] => {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem(STORAGE_KEYS.CONTACTS);
    return data ? JSON.parse(data) : [];
};

export const getContactsByFolder = (folderId: string): Contact[] => {
    const contacts = getContacts();
    return contacts.filter((c) => c.folderId === folderId);
};

export const saveContact = (contact: Omit<Contact, "id" | "createdAt">): Contact => {
    const contacts = getContacts();
    const newContact: Contact = {
        ...contact,
        id: generateId(),
        createdAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify([newContact, ...contacts]));
    return newContact;
};

export const updateContact = (id: string, updates: Partial<Contact>) => {
    const contacts = getContacts();
    const updatedContacts = contacts.map((c) => (c.id === id ? { ...c, ...updates } : c));
    localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(updatedContacts));
};

export const deleteContact = (id: string) => {
    const contacts = getContacts();
    const newContacts = contacts.filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(newContacts));
};
