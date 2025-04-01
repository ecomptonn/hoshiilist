import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./services/firebaseConfig";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Discover from "./pages/Discover";
import SeasonalCalendar from "./pages/SeasonalCalendar";
import AnimeDetails from "./pages/AnimeDetails";
import NotFound from "./pages/NotFound";

// Components
import Navigation from "./components/Navigation";
import ProtectedRoute from "./components/ProtectedRoute";

const App: React.FC = () => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                Loading...
            </div>
        );
    }

    return (
        <BrowserRouter>
            <div className="min-h-screen bg-gray-100">
                <Navigation user={user} />

                <main className="pb-12">
                    <Routes>
                        <Route
                            path="/"
                            element={
                                user ? (
                                    <Navigate to="/dashboard" replace />
                                ) : (
                                    <Navigate to="/discover" replace />
                                )
                            }
                        />

                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute user={user}>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />

                        <Route path="/discover" element={<Discover />} />
                        <Route
                            path="/seasonal"
                            element={<SeasonalCalendar />}
                        />
                        <Route path="/anime/:id" element={<AnimeDetails />} />

                        <Route
                            path="/login"
                            element={
                                user ? (
                                    <Navigate to="/dashboard" replace />
                                ) : (
                                    <Login />
                                )
                            }
                        />

                        <Route
                            path="/register"
                            element={
                                user ? (
                                    <Navigate to="/dashboard" replace />
                                ) : (
                                    <Register />
                                )
                            }
                        />

                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
};

export default App;
