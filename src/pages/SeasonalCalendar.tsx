import React, { useState, useEffect } from "react";
import { animeService } from "../services/animeService";
import AnimeCard from "../components/AnimeCard";

const SeasonalCalendar: React.FC = () => {
    // Current year and available seasons
    const currentYear = new Date().getFullYear();
    const seasons = ["winter", "spring", "summer", "fall"];

    // Current season based on date
    const getCurrentSeason = React.useCallback(() => {
        const month = new Date().getMonth();
        if (month >= 0 && month <= 2) return "winter";
        if (month >= 3 && month <= 5) return "spring";
        if (month >= 6 && month <= 8) return "summer";
        return "fall";
    }, []);

    // State
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedSeason, setSelectedSeason] = useState(getCurrentSeason());
    const [animeList, setAnimeList] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Years for selection (current year and 5 years back)
    const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

    // Fetch seasonal anime
    useEffect(() => {
        const fetchSeasonalAnime = async () => {
            setLoading(true);
            setError("");

            try {
                let response;

                // Use current season endpoint for current year and season
                if (
                    selectedYear === currentYear &&
                    selectedSeason === getCurrentSeason()
                ) {
                    response = await animeService.getCurrentSeasonAnime();
                } else {
                    response = await animeService.getSeasonAnime(
                        selectedYear,
                        selectedSeason
                    );
                }

                // Filter out duplicates before setting state
                const uniqueAnimeList = Array.from(
                    new Map(
                        response.data.map((item: any) => [item.mal_id, item])
                    ).values()
                );

                setAnimeList(uniqueAnimeList);
            } catch (err) {
                console.error("Error fetching seasonal anime:", err);
                setError(
                    "Failed to load seasonal anime. Please try again later."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchSeasonalAnime();
    }, [selectedYear, selectedSeason, currentYear, getCurrentSeason]);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-serif mb-6">Seasonal Anime</h1>

            {/* Season selector */}
            <div className="mb-8 flex flex-wrap gap-4">
                <div className="flex-grow max-w-xs">
                    <label
                        htmlFor="year-select"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Year
                    </label>
                    <select
                        id="year-select"
                        value={selectedYear}
                        onChange={(e) =>
                            setSelectedYear(parseInt(e.target.value))
                        }
                        className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        {years.map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex-grow max-w-xs">
                    <label
                        htmlFor="season-select"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Season
                    </label>
                    <select
                        id="season-select"
                        value={selectedSeason}
                        onChange={(e) => setSelectedSeason(e.target.value)}
                        className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 capitalize"
                    >
                        {seasons.map((season) => (
                            <option
                                key={season}
                                value={season}
                                className="capitalize"
                            >
                                {season}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Error message */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {/* Loading indicator */}
            {loading && (
                <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
            )}

            {/* Anime grid */}
            {!loading && animeList.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {animeList.map((anime, index) => (
                        <AnimeCard
                            key={`${anime.mal_id}-${index}`}
                            anime={anime}
                        />
                    ))}
                </div>
            )}

            {/* Empty state */}
            {!loading && animeList.length === 0 && (
                <div className="text-center py-10">
                    <p className="text-gray-500 text-lg">
                        No anime found for this season.
                    </p>
                </div>
            )}
        </div>
    );
};

export default SeasonalCalendar;
