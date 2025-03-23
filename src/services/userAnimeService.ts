// import firestore and firebaseConfig
import {
    doc,
    collection,
    setDoc,
    updateDoc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    serverTimestamp,
    deleteDoc,
} from "firebase/firestore";
import { db } from "./firebaseConfig";

// anime status types
export type AnimeStatus = "plan_to_watch" | "completed" | "watching";

// user anime entry interface
export interface AnimeEntry {
    animeId: number;
    status: AnimeStatus;
    currentEp: number;
    totalEp?: number;
    rating?: number;
    notes?: string;
    dateAdded?: any;
    dateUpdated?: any;
}

// user anime service
export const userAnimeService = {
    // add or update anime in user's list
    addAnimeToList: async (
        userId: string,
        animeEntry: AnimeEntry
    ): Promise<void> => {
        try {
            const animeRef = doc(
                db,
                `users/${userId}/animeList/${animeEntry.animeId}`
            );
            const animeDoc = await getDoc(animeRef);

            if (animeDoc.exists()) {
                // update existing entry
                await updateDoc(animeRef, {
                    ...animeEntry,
                    dateUpdated: serverTimestamp(),
                });
            } else {
                // create new entry
                await setDoc(animeRef, {
                    ...animeEntry,
                    dateAdded: serverTimestamp(),
                    dateUpdated: serverTimestamp(),
                });
            }
        } catch (error) {
            console.error("Error adding anime to list:", error);
            throw error;
        }
    },

    // Get user's anime list
    getUserAnimeList: async (userId: string): Promise<AnimeEntry[]> => {
        try {
            const animeListRef = collection(db, `users/${userId}/animeList`);
            const snapshot = await getDocs(animeListRef);

            return snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    ...data,
                    animeId: Number(doc.id),
                } as AnimeEntry;
            });
        } catch (error) {
            console.error("Error getting anime list:", error);
            throw error;
        }
    },

    // Get user's anime by status
    getAnimeByStatus: async (
        userId: string,
        status: AnimeStatus
    ): Promise<AnimeEntry[]> => {
        try {
            const animeListRef = collection(db, `users/${userId}/animeList`);
            const q = query(
                animeListRef,
                where("status", "==", status),
                orderBy("dateUpdated", "desc")
            );
            const snapshot = await getDocs(q);

            return snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    ...data,
                    animeId: Number(doc.id),
                } as AnimeEntry;
            });
        } catch (error) {
            console.error("Error getting anime by status:", error);
            throw error;
        }
    },

    // Get specific anime from user's list
    getUserAnimeById: async (
        userId: string,
        animeId: number
    ): Promise<AnimeEntry | null> => {
        try {
            const animeRef = doc(db, `users/${userId}/animeList/${animeId}`);
            const animeDoc = await getDoc(animeRef);

            if (animeDoc.exists()) {
                const data = animeDoc.data();
                return {
                    ...data,
                    animeId: Number(animeDoc.id),
                } as AnimeEntry;
            }

            return null;
        } catch (error) {
            console.error("Error getting anime details:", error);
            throw error;
        }
    },

    // Remove anime from user's list
    removeAnimeFromList: async (
        userId: string,
        animeId: number
    ): Promise<void> => {
        try {
            const animeRef = doc(db, `users/${userId}/animeList/${animeId}`);
            await deleteDoc(animeRef);
        } catch (error) {
            console.error("Error removing anime from list:", error);
            throw error;
        }
    },
};
