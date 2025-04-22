import React, { useState } from "react";
import { userAnimeService, AnimeStatus } from "../services/userAnimeService";

interface EpisodeTrackerProps {
    animeId: number;
    userId: string;
    initialEpisode?: number;
    totalEpisodes?: number;
    initialStatus?: AnimeStatus;
    onUpdate?: (currentEpisode: number, status: AnimeStatus) => void;
}

const EpisodeTracker: React.FC<EpisodeTrackerProps> = ({
    animeId,
    userId,
    initialEpisode = 0,
    totalEpisodes,
    initialStatus = "plan_to_watch",
    onUpdate,
}) => {
    const [currentEpisode, setCurrentEpisode] = useState(initialEpisode);
    const [status, setStatus] = useState<AnimeStatus>(initialStatus);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleIncrement = async () => {
        if (isUpdating) return;

        // Don't exceed total episodes if known
        if (totalEpisodes && currentEpisode >= totalEpisodes) return;

        setIsUpdating(true);
        const newEpisode = currentEpisode + 1;

        try {
            // If moving from plan_to_watch to watching the first episode
            let newStatus = status;
            if (status === "plan_to_watch" && newEpisode > 0) {
                newStatus = "watching";
                setStatus(newStatus);
            }

            // If reached the last episode, mark as completed
            if (totalEpisodes && newEpisode >= totalEpisodes) {
                newStatus = "completed";
                setStatus(newStatus);
            }

            // Update Firestore
            await userAnimeService.addAnimeToList(userId, {
                animeId,
                status: newStatus,
                currentEpisode: newEpisode,
                totalEpisodes,
            });

            setCurrentEpisode(newEpisode);

            // Notify parent component
            if (onUpdate) {
                onUpdate(newEpisode, newStatus);
            }
        } catch (error) {
            console.error("Error updating episode:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDecrement = async () => {
        if (isUpdating || currentEpisode <= 0) return;

        setIsUpdating(true);
        const newEpisode = currentEpisode - 1;

        try {
            // Update Firestore
            await userAnimeService.addAnimeToList(userId, {
                animeId,
                status,
                currentEpisode: newEpisode,
                totalEpisodes,
            });

            setCurrentEpisode(newEpisode);

            // Notify parent component
            if (onUpdate) {
                onUpdate(newEpisode, status);
            }
        } catch (error) {
            console.error("Error updating episode:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleStatusChange = async (
        e: React.ChangeEvent<HTMLSelectElement>
    ) => {
        if (isUpdating) return;

        const newStatus = e.target.value as AnimeStatus;
        setIsUpdating(true);

        try {
            // Update Firestore
            await userAnimeService.addAnimeToList(userId, {
                animeId,
                status: newStatus,
                currentEpisode,
                totalEpisodes,
            });

            setStatus(newStatus);

            // Notify parent component
            if (onUpdate) {
                onUpdate(currentEpisode, newStatus);
            }
        } catch (error) {
            console.error("Error updating status:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Episode Tracker</h3>
                <div className="flex items-center">
                    <select
                        value={status}
                        onChange={handleStatusChange}
                        disabled={isUpdating}
                        className="border rounded px-2 py-1 text-sm"
                    >
                        <option value="plan_to_watch">Plan to Watch</option>
                        <option value="watching">Watching</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
            </div>
            <div className="flex items-center justify-between">
                <button
                    onClick={handleDecrement}
                    disabled={isUpdating || currentEpisode <= 0}
                    className="bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center disabled:opacity-50"
                >
                    -
                </button>

                <div className="text-center">
                    <div className="text-xl font-bold">{currentEpisode}</div>
                    <div className="text-sm text-gray-500">
                        of {totalEpisodes || "?"}
                    </div>
                </div>

                <button
                    onClick={handleIncrement}
                    disabled={
                        isUpdating ||
                        (totalEpisodes !== undefined &&
                            currentEpisode >= totalEpisodes)
                    }
                    className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center disabled:opacity-50"
                >
                    +
                </button>
            </div>
        </div>
    );
};

export default EpisodeTracker;
