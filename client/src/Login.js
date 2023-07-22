import { useContext, useState } from "react";
import UserContext from "./UserProvider";
// import { useLocation, useNavigate } from "react-router-dom";

const Login = () => {
  const { user, setUser } = useContext(UserContext);
  const [userName, setUserName] = useState(user ?? "");

  // const navigate = useNavigate();
  // const location = useLocation();

  const login = (e) => {
    e.preventDefault();

    setUser(userName);
    // navigate(location.state?.next || "/", { replace: true });
  };
  return (
    <div className="login">
      <form onSubmit={(e) => login(e)}>
        <input
          type="text"
          onChange={(e) => {
            setUserName(e.target.value);
            setUser(e.target.value);
          }}
          value={userName}
          placeholder="Login"
        />
      </form>
    </div>
  );
};

export default Login;
