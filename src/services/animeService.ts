import axios from "axios";

// Base url for Jikan API
const API_BASE_URL = "https://api.jikan.moe/v4";

// Rate limiter to prevent API overload (3 request per second)
const axiosRateLimit = axios.create();
axiosRateLimit.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response && error.response.status === 429) {
            // wait 1 sec before retrying
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return axiosRateLimit(error.config);
        }

        return Promise.reject(error);
    }
);

// Anime API service
export const animeService = {
    // search anime by title
    searchAnime: async (query: string, page = 1) => {
        try {
            const response = await axiosRateLimit.get(`${API_BASE_URL}/anime`, {
                params: { q: query, page, limit: 20 },
            });
            return response.data;
        } catch (error) {
            console.error("Error searching anime", error);
            throw error;
        }
    },

    // get anime by id
    getAnimeById: async (id: number) => {
        try {
            const response = await axiosRateLimit.get(
                `${API_BASE_URL}/anime/${id}}`
            );
            return response.data;
        } catch (error) {
            console.error("Error fetching anime details", error);
            throw error;
        }
    },

    // get current season anime
    getCurrentSeasonAnime: async (page = 1) => {
        try {
            const response = await axiosRateLimit.get(
                `${API_BASE_URL}/seasons/now`,
                {
                    params: { page, limit: 20 },
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error fetching current season anime", error);
            throw error;
        }
    },

    // get anime for specific season
    getSeasonAnime: async (year: number, season: string, page = 1) => {
        try {
            const response = await axiosRateLimit.get(
                `${API_BASE_URL}/seasons/${year}/${season}`,
                {
                    params: { page, limit: 20 },
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error fetching season anime", error);
        }
    },

    // get top anime
    getTopAnime: async (page = 1) => {
        try {
            const response = await axiosRateLimit.get(
                `${API_BASE_URL}/top/anime`,
                {
                    params: { page, limit: 20 },
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error fetching top anime:", error);
            throw error;
        }
    },
};
