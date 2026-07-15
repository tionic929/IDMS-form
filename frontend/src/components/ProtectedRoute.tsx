import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute: React.FC = () => {
    const { user } = useAuth();

    return user ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;