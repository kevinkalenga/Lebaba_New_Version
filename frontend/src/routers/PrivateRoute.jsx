import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

const PrivateRoute = ({ children, role }) => {
    const { user, token } = useSelector((state) => state.auth);
    const location = useLocation();

    if (!user || !token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (role && user.role !== role) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default PrivateRoute;