import React, { useState, useEffect } from "react";
import { animeService } from "../services/animeService";
import AnimeCard from "../components/AnimeCard";

const Discover: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [trendingAnime, setTrendingAnime] = useState<any[]>([]);
    const [currentSeason, setCurrentSeason] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [error, setError] = useState("");

    // Fetch trending and seasonal anime on component mount
    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            setError("");

            try {
                // Fetch top anime
                const topAnimeResponse = await animeService.getTopAnime();
                setTrendingAnime(topAnimeResponse.data.slice(0, 8));

                // Fetch current season anime
                const seasonalResponse =
                    await animeService.getCurrentSeasonAnime();
                setCurrentSeason(seasonalResponse.data.slice(0, 8));
            } catch (err) {
                console.error("Error fetching initial data:", err);
                setError(
                    "Failed to load anime recommendations. Please try again later."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    // Handle search form submission
    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!searchQuery.trim()) return;

        setSearchLoading(true);
        setError("");

        try {
            const response = await animeService.searchAnime(searchQuery);
            setSearchResults(response.data);
        } catch (err) {
            console.error("Error searching anime:", err);
            setError("Failed to search anime. Please try again.");
        } finally {
            setSearchLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-serif mb-6">Discover Anime</h1>

            {/* Search form */}
            <div className="mb-8">
                <form onSubmit={handleSearch} className="flex">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search anime..."
                        className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <button
                        type="submit"
                        disabled={searchLoading}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-r-md hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {searchLoading ? "Searching..." : "Search"}
                    </button>
                </form>
            </div>

            {/* Error message */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {/* Search results */}
            {searchResults.length > 0 && (
                <div className="mb-10">
                    <h2 className="text-2xl font-serif mb-4">Search Results</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {searchResults.map((anime) => (
                            <AnimeCard key={anime.mal_id} anime={anime} />
                        ))}
                    </div>
                </div>
            )}

            {/* Loading indicator */}
            {loading && (
                <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
            )}

            {/* Trending anime */}
            {!loading && trendingAnime.length > 0 && (
                <div className="mb-10">
                    <h2 className="text-2xl font-serif mb-4">Trending Now</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {trendingAnime.map((anime) => (
                            <AnimeCard key={anime.mal_id} anime={anime} />
                        ))}
                    </div>
                </div>
            )}

            {/* Current season */}
            {!loading && currentSeason.length > 0 && (
                <div>
                    <h2 className="text-2xl font-serif mb-4">This Season</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {currentSeason.map((anime) => (
                            <AnimeCard key={anime.mal_id} anime={anime} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Discover;
