import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { auth } from "../services/firebaseConfig";
import { userAnimeService, AnimeStatus } from "../services/userAnimeService";
import { animeService } from "../services/animeService";
import AnimeCard from "../components/AnimeCard";

const Dashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<AnimeStatus>("watching");
    const [animeList, setAnimeList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchAnimeList = async () => {
            if (!auth.currentUser) return;

            setLoading(true);
            setError("");

            try {
                // Get anime list for the active status
                const userAnimeList = await userAnimeService.getAnimeByStatus(
                    auth.currentUser.uid,
                    activeTab
                );

                // Fetch full anime details for each entry
                const detailedList = await Promise.all(
                    userAnimeList.map(async (entry) => {
                        try {
                            const animeDetails =
                                await animeService.getAnimeById(entry.animeId);
                            return {
                                ...entry,
                                details: animeDetails.data,
                            };
                        } catch (err) {
                            console.error(
                                `Error fetching details for anime ${entry.animeId}:`,
                                err
                            );
                            return {
                                ...entry,
                                details: {
                                    title: "Loading failed",
                                    images: {
                                        jpg: { image_url: "/placeholder.jpg" },
                                    },
                                },
                            };
                        }
                    })
                );

                setAnimeList(detailedList);
            } catch (err) {
                console.error("Error fetching anime list:", err);
                setError("Failed to load your anime list. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchAnimeList();
    }, [activeTab]);

    const handleUpdateEpisode = async (animeId: number, newEpisode: number) => {
        if (!auth.currentUser) return;

        try {
            const animeEntry = await userAnimeService.getUserAnimeById(
                auth.currentUser.uid,
                animeId
            );

            if (animeEntry) {
                await userAnimeService.addAnimeToList(auth.currentUser.uid, {
                    ...animeEntry,
                    currentEpisode: newEpisode,
                });

                // Update local state
                setAnimeList((prevList) =>
                    prevList.map((item) =>
                        item.animeId === animeId
                            ? { ...item, currentEpisode: newEpisode }
                            : item
                    )
                );
            }
        } catch (err) {
            console.error("Error updating episode:", err);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-serif mb-6">My Anime Lists</h1>

            {/* Tabs */}
            <div className="mb-8 border-b">
                <div className="flex space-x-4 overflow-x-auto">
                    <button
                        className={`pb-2 px-4 font-medium ${
                            activeTab === "watching"
                                ? "border-b-2 border-indigo-600 text-indigo-600"
                                : "text-gray-500"
                        }`}
                        onClick={() => setActiveTab("watching")}
                    >
                        Watching
                    </button>
                    <button
                        className={`pb-2 px-4 font-medium ${
                            activeTab === "plan_to_watch"
                                ? "border-b-2 border-indigo-600 text-indigo-600"
                                : "text-gray-500"
                        }`}
                        onClick={() => setActiveTab("plan_to_watch")}
                    >
                        Plan to Watch
                    </button>
                    <button
                        className={`pb-2 px-4 font-medium ${
                            activeTab === "completed"
                                ? "border-b-2 border-indigo-600 text-indigo-600"
                                : "text-gray-500"
                        }`}
                        onClick={() => setActiveTab("completed")}
                    >
                        Completed
                    </button>
                </div>
            </div>

            {/* Error message */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {/* Loading state */}
            {loading && (
                <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
            )}

            {/* Empty state */}
            {!loading && animeList.length === 0 && (
                <div className="text-center py-10">
                    <h3 className="text-xl font-serif mb-2">
                        No anime in this list yet
                    </h3>
                    <p className="text-gray-600 mb-6">
                        Start adding anime to keep track of your progress
                    </p>
                    <Link
                        to="/discover"
                        className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition"
                    >
                        Discover Anime
                    </Link>
                </div>
            )}

            {/* Anime grid */}
            {!loading && animeList.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {animeList.map((item) => (
                        <div key={item.animeId} className="relative">
                            <AnimeCard anime={item.details} />

                            {/* Episode counter for watching status */}
                            {activeTab === "watching" && (
                                <div className="absolute bottom-4 right-4 flex items-center bg-white rounded-full shadow-md overflow-hidden">
                                    <button
                                        className="p-2 bg-gray-100 hover:bg-gray-200"
                                        onClick={() =>
                                            handleUpdateEpisode(
                                                item.animeId,
                                                Math.max(
                                                    0,
                                                    item.currentEpisode - 1
                                                )
                                            )
                                        }
                                    >
                                        -
                                    </button>
                                    <span className="px-3 font-medium text-sm">
                                        {item.currentEpisode}/
                                        {item.details.episodes || "?"}
                                    </span>
                                    <button
                                        className="p-2 bg-indigo-500 text-white hover:bg-indigo-600"
                                        onClick={() =>
                                            handleUpdateEpisode(
                                                item.animeId,
                                                item.currentEpisode + 1
                                            )
                                        }
                                    >
                                        +
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
