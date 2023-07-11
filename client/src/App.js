import { socket, connect } from "./socket";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
function App() {
  const navigate = useNavigate();

  const createLobby = (e) => {
    e.preventDefault();
    if (!id) connect();
    socket.emit("create-lobby", (e.target[0].value, id));
  };

  const joinLobby = (e) => {
    e.preventDefault();
    if (!id) connect();
    socket.emit("join", e.target[0].value);
  };

  const [id, setid] = useState("");
  const [room, setRoom] = useState("");

  useEffect(() => {
    socket.on("connect", () => {
      setid(socket.id);
    });

    socket.on("receive", (message) => {
      setRoom(message);
      navigate(`/game?lobby=${message}`);
    });

    return () => {
      socket.off("connect");
      socket.off("receive");
      console.log("disconnet");
      // socket.disconnect();
    };
  }, []);

  return (
    <div className="App">
      <h1>Join Lobby!</h1>
      <form onSubmit={(e) => joinLobby(e)}>
        <input type="text" placeholder="Join Lobby" />
        <input type="submit" />
      </form>
      <h1>Create Lobby!</h1>
      <form onSubmit={(e) => createLobby(e)}>
        <input type="text" placeholder="Create Lobby" />
        <input type="submit" />
      </form>
      <div>Connesso: {id}</div>
      <div>{room}</div>
    </div>
  );
}

export default App;
