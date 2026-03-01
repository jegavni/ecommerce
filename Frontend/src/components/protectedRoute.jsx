import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const { user, checkingAuth } = useSelector(state => state.user);

  if (checkingAuth) return <div>Loading...</div>;

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;