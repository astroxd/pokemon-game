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
    <div>
      <h2 className="text-2xl font-bold mb-2 text-[#F9C934] drop-shadow">
        Login
      </h2>
      <form onSubmit={(e) => login(e)}>
        <input
          type="text"
          onChange={(e) => {
            setUserName(e.target.value);
            setUser(e.target.value);
          }}
          value={userName}
          placeholder="Your Username"
          className="w-full p-2 rounded"
        />
      </form>
    </div>
  );
};

export default Login;
