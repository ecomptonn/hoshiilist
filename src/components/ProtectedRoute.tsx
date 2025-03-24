import React from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
    user: any;
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ user, children }) => {
    if (!user) {
        // redirect to login if user is not auth'd
        return <Navigate to="/login" replace />;
    }

    // render children if user is auth'd
    return <>{children}</>;
};

export default ProtectedRoute;
