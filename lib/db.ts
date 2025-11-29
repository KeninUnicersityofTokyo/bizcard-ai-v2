import { db } from "@/lib/firebase";
import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    deleteDoc,
    doc,
    orderBy,
    serverTimestamp,
    getDoc,
    updateDoc,
    onSnapshot,
    Unsubscribe,
    setDoc,
} from "firebase/firestore";
import { Contact, Folder } from "@/types";

// In-memory cache
const contactCache = new Map<string, Contact>();
const folderCache = new Map<string, Folder[]>();

// --- Folders ---

export const getFolders = async (userId: string): Promise<Folder[]> => {
    if (folderCache.has(userId)) {
        return folderCache.get(userId)!;
    }

    const q = query(
        collection(db, `users/${userId}/folders`),
        orderBy("createdAt", "asc")
    );
    const querySnapshot = await getDocs(q);
    const folders = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as Folder[];

    folderCache.set(userId, folders);
    return folders;
};

export const createFolder = async (userId: string, name: string): Promise<Folder> => {
    const docRef = await addDoc(collection(db, `users/${userId}/folders`), {
        name,
        createdAt: Date.now(), // Use timestamp for simpler sorting locally, or serverTimestamp()
    });
    const newFolder = {
        id: docRef.id,
        name,
        createdAt: Date.now(),
    };

    // Invalidate or update cache
    if (folderCache.has(userId)) {
        const current = folderCache.get(userId)!;
        folderCache.set(userId, [...current, newFolder]);
    }

    return newFolder;
};

export const deleteFolder = async (userId: string, folderId: string) => {
    await deleteDoc(doc(db, `users/${userId}/folders`, folderId));
    // Note: Subcollections (contacts) are not automatically deleted in Firestore.
    // We should ideally delete them or move them. For now, we'll leave them orphaned or handle via Cloud Functions.
    // Or we can query and delete them here client-side (ok for small scale).

    // Update cache
    if (folderCache.has(userId)) {
        const current = folderCache.get(userId)!;
        folderCache.set(userId, current.filter(f => f.id !== folderId));
    }
};

// --- Contacts ---

export const getContacts = async (userId: string): Promise<Contact[]> => {
    const q = query(
        collection(db, `users/${userId}/contacts`),
        orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    const contacts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as Contact[];

    // Populate cache
    contacts.forEach(c => contactCache.set(c.id, c));

    return contacts;
};

export const getContactsByFolder = async (userId: string, folderId: string): Promise<Contact[]> => {
    const q = query(
        collection(db, `users/${userId}/contacts`),
        where("folderId", "==", folderId),
        orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    const contacts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as Contact[];

    // Populate cache
    contacts.forEach(c => contactCache.set(c.id, c));

    return contacts;
};

export const getContact = async (userId: string, contactId: string): Promise<Contact | null> => {
    // Check cache first
    if (contactCache.has(contactId)) {
        return contactCache.get(contactId)!;
    }

    const docRef = doc(db, `users/${userId}/contacts`, contactId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const contact = { id: docSnap.id, ...docSnap.data() } as Contact;
        contactCache.set(contact.id, contact);
        return contact;
    }
    return null;
};

export const saveContact = async (userId: string, contact: Omit<Contact, "id" | "createdAt">): Promise<Contact> => {
    // Separate image from main data to improve performance
    const { imageBase64, ...mainData } = contact;

    const data = {
        ...mainData,
        createdAt: Date.now(),
    };

    const docRef = await addDoc(collection(db, `users/${userId}/contacts`), data);

    // If there is an image, save it to a subcollection
    if (imageBase64) {
        try {
            await setDoc(doc(db, `users/${userId}/contacts/${docRef.id}/private/image`), {
                base64: imageBase64
            });
        } catch (e) {
            console.error("Failed to save image to subcollection", e);
        }
    }

    const newContact = {
        id: docRef.id,
        ...data,
        imageBase64: imageBase64
    };

    // Update cache
    contactCache.set(newContact.id, newContact);

    return newContact;
};

export const getContactImage = async (userId: string, contactId: string): Promise<string | null> => {
    try {
        const docRef = doc(db, `users/${userId}/contacts/${contactId}/private/image`);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data().base64 as string;
        }
    } catch (e) {
        console.error("Error fetching contact image:", e);
    }
    return null;
};

export const updateContact = async (userId: string, contactId: string, updates: Partial<Contact>) => {
    const docRef = doc(db, `users/${userId}/contacts`, contactId);
    await updateDoc(docRef, updates);

    // Update cache
    if (contactCache.has(contactId)) {
        const current = contactCache.get(contactId)!;
        contactCache.set(contactId, { ...current, ...updates });
    }
};

// Soft delete (move to trash)
export const deleteContact = async (userId: string, contactId: string) => {
    const docRef = doc(db, `users/${userId}/contacts`, contactId);
    const updates = {
        folderId: "trash",
        deletedAt: Date.now()
    };
    await updateDoc(docRef, updates);

    // Update cache
    if (contactCache.has(contactId)) {
        const current = contactCache.get(contactId)!;
        contactCache.set(contactId, { ...current, ...updates });
    }
};

// Permanent delete
export const permanentlyDeleteContact = async (userId: string, contactId: string) => {
    await deleteDoc(doc(db, `users/${userId}/contacts`, contactId));

    // Remove from cache
    contactCache.delete(contactId);
};

// Restore from trash
export const restoreContact = async (userId: string, contactId: string) => {
    const docRef = doc(db, `users/${userId}/contacts`, contactId);
    // Restore to 'drafts' by default or we could store previous folder. 
    // For simplicity, let's restore to 'drafts' or 'inbox' if we had one. 
    // Let's use 'drafts' as safe default or check if we can store original folder.
    // For now, restoring to 'drafts' is safe.
    const updates = {
        folderId: "drafts",
        deletedAt: null
    };
    await updateDoc(docRef, updates);

    // Update cache
    if (contactCache.has(contactId)) {
        const current = contactCache.get(contactId)!;
        contactCache.set(contactId, { ...current, ...updates });
    }
};

// Cleanup trash (delete items older than 7 days)
export const cleanupTrash = async (userId: string) => {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const q = query(
        collection(db, `users/${userId}/contacts`),
        where("folderId", "==", "trash"),
        where("deletedAt", "<", sevenDaysAgo)
    );

    const snapshot = await getDocs(q);
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    // Clear cache for deleted items
    snapshot.docs.forEach(doc => contactCache.delete(doc.id));
};

export const subscribeToContacts = (userId: string, callback: (contacts: Contact[]) => void): Unsubscribe => {
    const q = query(
        collection(db, `users/${userId}/contacts`),
        orderBy("createdAt", "desc")
    );
    return onSnapshot(q, (snapshot) => {
        const contacts = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Contact[];

        // Update cache
        contacts.forEach(c => contactCache.set(c.id, c));

        callback(contacts);
    }, (error) => {
        console.error("Error in subscribeToContacts:", error);
    });
};

export const subscribeToContactsByFolder = (userId: string, folderId: string, callback: (contacts: Contact[]) => void): Unsubscribe => {
    const q = query(
        collection(db, `users/${userId}/contacts`),
        where("folderId", "==", folderId),
        orderBy("createdAt", "desc")
    );
    return onSnapshot(q, (snapshot) => {
        const contacts = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Contact[];

        // Update cache
        contacts.forEach(c => contactCache.set(c.id, c));

        callback(contacts);
    }, (error) => {
        console.error("Error in subscribeToContactsByFolder:", error);
    });
};

// --- Settings (Signature) ---

export const getSignature = async (userId: string): Promise<string> => {
    try {
        const docRef = doc(db, `users/${userId}/settings/signature`);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data().text || "";
        }
    } catch (e) {
        console.error("Error fetching signature:", e);
    }
    return "";
};

export const saveSignature = async (userId: string, text: string) => {
    try {
        const docRef = doc(db, `users/${userId}/settings/signature`);
        await setDoc(docRef, { text }, { merge: true });
    } catch (e) {
        console.error("Error saving signature:", e);
        throw e;
    }
};

// --- Sharing ---

export const createSharedItem = async (userId: string, contact: Contact): Promise<string> => {
    try {
        // Create a new document in the root 'shared_items' collection
        // We store a snapshot of the contact data
        const data = {
            ownerId: userId,
            originalContactId: contact.id,
            data: contact,
            createdAt: Date.now(),
        };

        const docRef = await addDoc(collection(db, "shared_items"), data);
        return docRef.id;
    } catch (e) {
        console.error("Error creating shared item:", e);
        throw e;
    }
};

export const getSharedItem = async (shareId: string): Promise<any | null> => {
    try {
        const docRef = doc(db, "shared_items", shareId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        }
        return null;
    } catch (e) {
        console.error("Error fetching shared item:", e);
        return null;
    }
};
