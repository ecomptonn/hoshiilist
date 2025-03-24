import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../services/firebaseConfig";
import { authService } from "../services/authService";

interface NavigationProps {
    user: any;
}

const Navigation: React.FC<NavigationProps> = ({ user }) => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await authService.logout();
            navigate("/login");
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    return (
        <nav className="bg-indigo-600 text-white shadow-md">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center py-3">
                    {/* Logo */}
                    <Link to="/" className="text-xl font-bold">
                        HoshiiList
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-6">
                        <Link to="/discover" className="hover:text-indigo-200">
                            Discover
                        </Link>
                        <Link to="/seasonal" className="hover:text-indigo-200">
                            Seasonal
                        </Link>
                        {user ? (
                            <>
                                <Link
                                    to="/dashboard"
                                    className="hover:text-indigo-200"
                                >
                                    My Lists
                                </Link>
                                <div className="flex items-center space-x-2">
                                    {user.photoURL && (
                                        <img
                                            src={user.photoURL}
                                            alt="Profile"
                                            className="w-8 h-8 rounded-full"
                                        />
                                    )}
                                    <span>
                                        {user.displayName || user.email}
                                    </span>
                                    <button
                                        onClick={handleLogout}
                                        className="bg-indigo-700 px-3 py-1 rounded hover:bg-indigo-800"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="space-x-2">
                                <Link
                                    to="/login"
                                    className="bg-indigo-700 px-3 py-1 rounded hover:bg-indigo-800"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-white text-indigo-600 px-3 py-1 rounded hover:bg-indigo-100"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button
                        className="md:hidden"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden pb-4">
                        <Link
                            to="/discover"
                            className="block py-2 hover:text-indigo-200"
                        >
                            Discover
                        </Link>
                        <Link
                            to="/seasonal"
                            className="block py-2 hover:text-indigo-200"
                        >
                            Seasonal
                        </Link>
                        {user ? (
                            <>
                                <Link
                                    to="/dashboard"
                                    className="block py-2 hover:text-indigo-200"
                                >
                                    My Lists
                                </Link>
                                <div className="flex items-center space-x-2 py-2">
                                    {user.photoURL && (
                                        <img
                                            src={user.photoURL}
                                            alt="Profile"
                                            className="w-8 h-8 rounded-full"
                                        />
                                    )}
                                    <span>
                                        {user.displayName || user.email}
                                    </span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="block w-full text-left py-2 text-indigo-200"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <div className="flex flex-col space-y-2 pt-2">
                                <Link
                                    to="/login"
                                    className="block bg-indigo-700 px-3 py-1 rounded hover:bg-indigo-800 text-center"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="block bg-white text-indigo-600 px-3 py-1 rounded hover:bg-indigo-100 text-center"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navigation;
