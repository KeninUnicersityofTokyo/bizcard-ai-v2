"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
    GoogleAuthProvider,
    signInWithPopup,
    signInWithCredential,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Capacitor } from "@capacitor/core";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithGoogle: (options?: { forceSelection?: boolean }) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signInWithGoogle: async () => { },
    signOut: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    interface SignInOptions {
        forceSelection?: boolean;
    }

    const signInWithGoogle = async (options?: SignInOptions) => {
        try {
            if (Capacitor.isNativePlatform()) {
                const { GoogleAuth } = await import('@codetrix-studio/capacitor-google-auth');
                const googleUser = await GoogleAuth.signIn();
                const idToken = googleUser.authentication.idToken;
                const credential = GoogleAuthProvider.credential(idToken);
                await signInWithCredential(auth, credential);
            } else {
                const provider = new GoogleAuthProvider();
                if (options?.forceSelection) {
                    provider.setCustomParameters({
                        prompt: 'select_account'
                    });
                }
                await signInWithPopup(auth, provider);
            }
        } catch (error: any) {
            console.error("Error signing in with Google", error);
            // If native sign-in fails or is cancelled, we might want to show an alert
            if (Capacitor.isNativePlatform()) {
                alert(`Login failed: ${error.message || JSON.stringify(error)}`);
            }
        }
    };

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
        } catch (error) {
            console.error("Error signing out", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
