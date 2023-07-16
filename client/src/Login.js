import { useContext, useState } from "react";
import UserContext from "./UserProvider";
import { useLocation, useNavigate } from "react-router-dom";

const Login = () => {
  const [userName, setUserName] = useState("");
  const { setUser } = useContext(UserContext);

  const navigate = useNavigate();
  const location = useLocation();

  const login = (e) => {
    e.preventDefault();

    setUser(userName);
    navigate(location.state?.next || "/", { replace: true });
  };
  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={(e) => login(e)}>
        <input
          type="text"
          onChange={(e) => setUserName(e.target.value)}
          value={userName}
        />
      </form>
    </div>
  );
};

export default Login;
