export interface Folder {
    id: string;
    name: string;
    createdAt: number;
}

export interface Contact {
    id: string;
    folderId: string; // 'default' or specific folder UUID
    name: string;
    company: string;
    email: string;
    context: string; // Voice note transcript
    imageBase64?: string | null; // Optional, as manual input might not have it
    generatedEmail: {
        subject: string;
        body: string;
        cc?: string;
        bcc?: string;
    };
    createdAt: number;
}

export interface SharedItem {
    id: string;
    ownerId: string;
    originalContactId: string;
    data: Contact;
    createdAt: number;
    expiresAt?: number;
}
