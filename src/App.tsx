import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./services/firebaseConfig";

// Pages
import Login from "./pages/Login";

// Components
import Navigation from "./components/Navigation";

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
                                    <div className="p-8">
                                        Dashboard Placeholder
                                    </div>
                                ) : (
                                    <Navigate to="/login" replace />
                                )
                            }
                        />
                        <Route
                            path="/login"
                            element={
                                user ? <Navigate to="/" replace /> : <Login />
                            }
                        />
                        <Route
                            path="/dashboard"
                            element={
                                user ? (
                                    <div className="p-8">
                                        Dashboard Placeholder
                                    </div>
                                ) : (
                                    <Navigate to="/login" replace />
                                )
                            }
                        />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
};

export default App;
