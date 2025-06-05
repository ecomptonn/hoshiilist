import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { auth } from "../services/firebaseConfig";
import { animeService } from "../services/animeService";
import { userAnimeService, AnimeStatus } from "../services/userAnimeService";
import EpisodeTracker from "../components/EpisodeTracker";

const AnimeDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const animeId = parseInt(id || "0");
    const [anime, setAnime] = useState<any>(null);
    const [userEntry, setUserEntry] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedStatus, setSelectedStatus] =
        useState<AnimeStatus>("plan_to_watch");

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError("");

            try {
                const animeData = await animeService.getAnimeById(animeId);
                setAnime(animeData.data);

                if (auth.currentUser) {
                    const entry = await userAnimeService.getUserAnimeById(
                        auth.currentUser.uid,
                        animeId
                    );
                    if (entry) {
                        setUserEntry(entry);
                        setSelectedStatus(entry.status);
                    }
                }
            } catch (err) {
                console.error("Error fetching anime details:", err);
                setError("Failed to load anime details.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [animeId]);

    const handleAddToList = async () => {
        if (!auth.currentUser) {
            return;
        }

        try {
            const entry = {
                animeId,
                status: selectedStatus,
                currentEpisode: userEntry?.currentEpisode || 0,
                totalEpisodes: anime?.episodes || null,
            };

            await userAnimeService.addAnimeToList(auth.currentUser.uid, entry);
            setUserEntry(entry);
        } catch (err) {
            console.error("Error adding anime to list:", err);
            setError("Failed to add anime to your list. Please try again.");
        }
    };

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedStatus(e.target.value as AnimeStatus);
    };

    const handleEpisodeUpdate = (
        currentEpisode: number,
        status: AnimeStatus
    ) => {
        setUserEntry({
            ...userEntry,
            currentEpisode,
            status,
        });
        setSelectedStatus(status);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (error || !anime) {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error || "Anime not found."}
                </div>
                <div className="mt-4">
                    <Link
                        to="/discover"
                        className="text-indigo-600 hover:text-indigo-800"
                    >
                        &larr; Back to Discover
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-4">
                <Link
                    to="/discover"
                    className="text-indigo-600 hover:text-indigo-800"
                >
                    &larr; Back to Discover
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Header */}
                <div
                    className="relative bg-indigo-900 text-white py-10 px-6"
                    style={{
                        backgroundImage: `linear-gradient(rgba(67, 56, 202, 0.9), rgba(67, 56, 202, 0.95)), url(${anime.images.jpg.large_image_url})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                >
                    <div className="flex flex-col md:flex-row">
                        <div className="md:w-1/4 mb-6 md:mb-0">
                            <img
                                src={anime.images.jpg.large_image_url}
                                alt={anime.title}
                                className="rounded-lg shadow-lg w-full max-w-xs mx-auto md:mx-0"
                            />
                        </div>

                        <div className="md:w-3/4 md:pl-8">
                            <h1 className="text-3xl md:text-4xl font-serif mb-2">
                                {anime.title}
                            </h1>
                            {anime.title_english &&
                                anime.title_english !== anime.title && (
                                    <h2 className="text-xl opacity-80 mb-4">
                                        {anime.title_english}
                                    </h2>
                                )}

                            <div className="flex flex-wrap items-center mb-4 text-sm">
                                {anime.score && (
                                    <div className="mr-4 flex items-center">
                                        <svg
                                            className="w-5 h-5 text-yellow-300 mr-1"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                        </svg>
                                        <span>{anime.score}</span>
                                    </div>
                                )}

                                <div className="mr-4">
                                    {anime.episodes
                                        ? `${anime.episodes} episodes`
                                        : "Unknown episodes"}
                                </div>

                                <div className="mr-4">{anime.status}</div>

                                {anime.aired.from && (
                                    <div>
                                        {new Date(
                                            anime.aired.from
                                        ).getFullYear()}
                                        {anime.aired.to &&
                                            ` - ${new Date(
                                                anime.aired.to
                                            ).getFullYear()}`}
                                    </div>
                                )}
                            </div>

                            <div className="mb-6">
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {anime.genres.map((genre: any) => (
                                        <span
                                            key={genre.mal_id}
                                            className="px-3 py-1 bg-indigo-800 rounded-full text-xs"
                                        >
                                            {genre.name}
                                        </span>
                                    ))}
                                </div>
                                <div className="text-sm opacity-80">
                                    {anime.studios
                                        .map((studio: any) => studio.name)
                                        .join(", ")}
                                </div>
                            </div>

                            {/* Add to list section */}
                            {auth.currentUser && (
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 p-4 bg-white rounded-lg">
                                    <div className="flex-grow">
                                        <label
                                            htmlFor="status-select"
                                            className="block text-sm font-medium mb-1 text-black"
                                        >
                                            Add to your list
                                        </label>
                                        <select
                                            id="status-select"
                                            value={selectedStatus}
                                            onChange={handleStatusChange}
                                            className="w-full px-3 py-2 bg-indigo-700 border border-indigo-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                        >
                                            <option value="plan_to_watch">
                                                Plan to Watch
                                            </option>
                                            <option value="watching">
                                                Watching
                                            </option>
                                            <option value="completed">
                                                Completed
                                            </option>
                                        </select>
                                    </div>
                                    <button
                                        onClick={handleAddToList}
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white transition mt-2 sm:mt-6"
                                    >
                                        {userEntry ? "Update" : "Add to List"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main content area */}
                <div className="p-6">
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Main column */}
                        <div className="md:w-2/3">
                            <section className="mb-8">
                                <h2 className="text-2xl font-serif mb-4">
                                    Summary
                                </h2>
                                <p className="text-gray-700 whitespace-pre-line">
                                    {anime.synopsis}
                                </p>
                            </section>

                            {anime.trailer.embed_url && (
                                <section className="mb-8">
                                    <h2 className="text-2xl font-serif mb-4">
                                        Trailer
                                    </h2>
                                    <div className="relative pt-[56.25%]">
                                        <iframe
                                            src={anime.trailer.embed_url.replace(
                                                "autoplay=1",
                                                "autoplay=0"
                                            )}
                                            title="Trailer"
                                            frameBorder="0"
                                            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            className="absolute inset-0 w-full h-full rounded-lg"
                                        ></iframe>
                                    </div>
                                </section>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="md:w-1/3">
                            {/* Episode tracker */}
                            {auth.currentUser && userEntry && (
                                <div className="mb-6">
                                    <EpisodeTracker
                                        animeId={animeId}
                                        userId={auth.currentUser.uid}
                                        initialEpisode={
                                            userEntry.currentEpisode
                                        }
                                        totalEpisodes={anime.episodes}
                                        initialStatus={userEntry.status}
                                        onUpdate={handleEpisodeUpdate}
                                    />
                                </div>
                            )}

                            {/* Information box */}
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <h3 className="text-lg font-serif mb-3">
                                    Information
                                </h3>
                                <div className="space-y-2 text-sm">
                                    {anime.type && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">
                                                Type:
                                            </span>
                                            <span className="font-medium">
                                                {anime.type}
                                            </span>
                                        </div>
                                    )}
                                    {anime.episodes && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">
                                                Episodes:
                                            </span>
                                            <span className="font-medium">
                                                {anime.episodes}
                                            </span>
                                        </div>
                                    )}
                                    {anime.duration && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">
                                                Duration:
                                            </span>
                                            <span className="font-medium">
                                                {anime.duration}
                                            </span>
                                        </div>
                                    )}
                                    {anime.status && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">
                                                Status:
                                            </span>
                                            <span className="font-medium">
                                                {anime.status}
                                            </span>
                                        </div>
                                    )}
                                    {anime.aired.from && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">
                                                Aired:
                                            </span>
                                            <span className="font-medium">
                                                {new Date(
                                                    anime.aired.from
                                                ).toLocaleDateString()}
                                                {anime.aired.to &&
                                                    ` to ${new Date(
                                                        anime.aired.to
                                                    ).toLocaleDateString()}`}
                                            </span>
                                        </div>
                                    )}
                                    {anime.season && anime.year && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">
                                                Season:
                                            </span>
                                            <span className="font-medium capitalize">
                                                {anime.season} {anime.year}
                                            </span>
                                        </div>
                                    )}
                                    {anime.rating && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">
                                                Rating:
                                            </span>
                                            <span className="font-medium">
                                                {anime.rating}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* External links section */}
                            {anime.external &&
                                Array.isArray(anime.external) &&
                                anime.external.length > 0 && (
                                    <div className="mt-6">
                                        <h3 className="text-lg font-serif mb-3">
                                            External Links
                                        </h3>
                                        <div className="space-y-2">
                                            {anime.external.map((link: any) => (
                                                <a
                                                    key={link.name}
                                                    href={link.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="block bg-white p-2 border border-gray-200 rounded hover:bg-gray-50 transition flex items-center"
                                                >
                                                    <span className="flex-grow">
                                                        {link.name}
                                                    </span>
                                                    <svg
                                                        className="h-4 w-4 text-gray-400"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                                        />
                                                    </svg>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnimeDetails;
