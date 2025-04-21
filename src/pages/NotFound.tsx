import React from "react";
import { Link } from "react-router-dom";

const NotFound: React.FC = () => {
    return (
        <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="font-serif text-4xl mb-4">404 - Page Not Found</h1>
            <p className="text-lg mb-8">
                The page you're looking for doesn't exist.
            </p>
            <Link
                to="/"
                className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition"
            >
                Return to Home
            </Link>
        </div>
    );
};

export default NotFound;
