import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * ProtectedRoute
 * 
 * 1. If not authenticated -> redirect to /login
 * 2. If role mismatch -> redirect to /unauthorized
 * 3. Else render children
 * 
 * @param {string|string[]} allowedRoles - Single role or array of allowed roles
 */
export const ProtectedRoute = ({ children, role: allowedRoles }) => {
    const { isAuthenticated, user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    const storedRole = (localStorage.getItem("rm_role") || user?.user_metadata?.role || user?.role || "").toLowerCase();
    if (!storedRole && location.pathname !== "/select-role") {
        return <Navigate to="/select-role" replace />;
    }

    // Role check logic
    if (allowedRoles) {
        const allowedRolesArray = Array.isArray(allowedRoles)
            ? allowedRoles.map(r => r.toLowerCase())
            : [allowedRoles.toLowerCase()];

        const userRole = storedRole;

        if (!allowedRolesArray.includes(userRole)) {
            return <Navigate to="/unauthorized" replace />;
        }
    }

    return children;
};
