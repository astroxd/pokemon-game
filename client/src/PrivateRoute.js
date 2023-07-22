const { useContext } = require("react");
const { useLocation, Outlet, Navigate } = require("react-router-dom");
const { default: UserContext } = require("./UserProvider");

const PrivateRoute = () => {
  const location = useLocation();
  const { user } = useContext(UserContext);

  return user ? (
    <Outlet />
  ) : (
    <Navigate to="/" state={{ next: location.pathname }} replace />
  );
};
export default PrivateRoute;
