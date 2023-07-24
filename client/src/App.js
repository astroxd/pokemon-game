import { socket, connect } from "./socket";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserContext from "./UserProvider";
import Login from "./Login";
import logo from "./assets/logo.png";
import lucario from "./assets/lucario.png";
import giratina from "./assets/giratina.png";
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
    <div className="App p-4 relative">
      <img src={logo} alt="logo" width={350} />
      <img src={lucario} alt="lucario" className="absolute left-10 bottom-0" />
      <img src={giratina} alt="giratina" className="absolute right-10 top-0" />
      <div className="bg-[#3c85de] p-12 w-[30%] flex flex-col gap-4 mt-8 rounded">
        <Login />
        <div>
          <h2 className="text-2xl font-bold mb-2 text-[#F9C934] drop-shadow">
            Play
          </h2>
          <form
            onSubmit={(e) => joinLobby(e)}
            className="flex flex-col gap-1 mb-1"
          >
            <input
              type="text"
              placeholder="Join Lobby"
              className="p-2 rounded"
            />
            <input
              type="submit"
              value={"Join Lobby"}
              className="py-2 bg-green-400 rounded cursor-pointer"
            />
          </form>
          <form onSubmit={(e) => createLobby(e)}>
            <input
              type="submit"
              value={"Create Lobby"}
              className="py-2 bg-red-400 rounded w-full cursor-pointer"
            />
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
