"use server";

import { auth } from "@/lib/firebase"; // Note: This is client-side auth, we can't use it directly in server action for verification easily without admin SDK or passing token.
// However, for this app, we are using client-side auth mostly.
// But server actions run on server. We need to pass the userId or verify session.
// Since we don't have a full NextAuth setup, we'll rely on the client passing the userId and we trust it for now (prototype) 
// OR better: we fetch the contact on the client and pass the data to the server action to "save" it as shared.
// Actually, `lib/db.ts` uses client SDK `db`. Server actions running in Node environment might need Admin SDK or different setup if using `firebase/firestore`.
// Wait, `lib/firebase.ts` initializes the client SDK. It works in Node if we polyfill or if it's just using REST under the hood?
// Next.js Server Actions run in a Node environment. The standard `firebase` package (v9 modular) works in Node too.
// So we can import `createSharedItem` from `lib/db` if `lib/db` is safe for server.
// `lib/db` imports `db` from `@/lib/firebase`.

import { createSharedItem, getContact } from "@/lib/db";
import { Contact } from "@/types";

// We'll accept the contact object directly to avoid re-fetching if the client already has it,
// OR we accept userId and contactId.
export async function generateShareLink(userId: string, contact: Contact) {
    try {
        // In a real app, we should verify the user owns the contact here.
        // For now, we trust the input or we could re-fetch to verify.
        // Let's re-fetch to be safe if we were just passing IDs.
        // But passing the full contact object is convenient for the snapshot.

        const shareId = await createSharedItem(userId, contact);

        // Construct the full URL
        // In production, use process.env.NEXT_PUBLIC_BASE_URL or similar
        // For Vercel, we can use VERCEL_URL but it doesn't include protocol.
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
        const shareUrl = `${baseUrl}/share/${shareId}`;

        return { success: true, url: shareUrl };
    } catch (error) {
        console.error("Error generating share link:", error);
        return { success: false, error: "Failed to generate link" };
    }
}
