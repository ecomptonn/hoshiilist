import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    updateProfile,
    User,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "./firebaseConfig";

// User type
interface UserData {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    createdAt: Date;
}

// Auth functions
export const authService = {
    // Register with email and password
    registerWithEmail: async (
        email: string,
        password: string,
        displayName: string
    ): Promise<User> => {
        try {
            // Create user with Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

            // Update profile with display name
            await updateProfile(userCredential.user, { displayName });

            // Create user document in Firestore
            await setDoc(doc(db, "users", userCredential.user.uid), {
                uid: userCredential.user.uid,
                email,
                displayName,
                photoURL: userCredential.user.photoURL,
                createdAt: serverTimestamp(),
            });

            return userCredential.user;
        } catch (error) {
            console.error("Error registering user:", error);
            throw error;
        }
    },

    // Sign in with email and password
    loginWithEmail: async (email: string, password: string): Promise<User> => {
        try {
            const userCredential = await signInWithEmailAndPassword(
                auth,
                email,
                password
            );
            return userCredential.user;
        } catch (error) {
            console.error("Error logging in:", error);
            throw error;
        }
    },

    // Sign in with Google
    loginWithGoogle: async (): Promise<User> => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // Check if user document exists
            const userDoc = await getDoc(doc(db, "users", user.uid));

            // If user doesn't exist in Firestore yet, create a document
            if (!userDoc.exists()) {
                await setDoc(doc(db, "users", user.uid), {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                    createdAt: serverTimestamp(),
                });
            }

            return user;
        } catch (error) {
            console.error("Error signing in with Google:", error);
            throw error;
        }
    },

    // Sign out
    logout: async (): Promise<void> => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out:", error);
            throw error;
        }
    },

    // Get current user
    getCurrentUser: (): User | null => {
        return auth.currentUser;
    },
};
