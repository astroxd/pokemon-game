import { socket, connect } from "./socket";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserContext from "./UserProvider";
import Login from "./Login";
function App() {
  const navigate = useNavigate();

  const { user, setUser } = useContext(UserContext);

  const createLobby = (e) => {
    e.preventDefault();
    if (!id) connect();
    socket.emit("create-lobby", user);
  };

  const joinLobby = (e) => {
    e.preventDefault();
    if (!id) connect();

    const roomCode = e.target[0].value;
    if (roomCode === "") return;

    socket.emit("join", roomCode, user);
  };

  const [id, setid] = useState("");
  const [room, setRoom] = useState("");

  useEffect(() => {
    socket.on("connect", () => {
      setid(socket.id);
    });

    socket.on("receive", (message) => {
      console.log("receive", message);
      setRoom(message);
      navigate(`/game?lobby=${message}`);
    });

    return () => {
      socket.off("connect");
      socket.off("receive");
      console.log("disconnet");
    };
  }, []);

  return (
    <div className="App">
      <h1 className="logo">Guess That Pokemon</h1>
      <div className="form">
        <Login />
        <form onSubmit={(e) => joinLobby(e)}>
          <input type="text" placeholder="Join Lobby" />
          <input type="submit" value={"Join Lobby"} />
        </form>
        <form onSubmit={(e) => createLobby(e)}>
          <input type="submit" value={"Create Lobby"} />
        </form>
      </div>
    </div>
  );
}

export default App;
