import { useEffect, useMemo, useState } from "react";
import { getId, socket } from "./socket";
import { useLocation } from "react-router-dom";
import Game from "./Game";

const Lobby = () => {
  const location = useLocation();
  let room = location.search.slice(7, 15);

  const [players, setPlayers] = useState([]);

  const getPlayers = useMemo(() => {
    console.log("get players", room);
    socket.emit("get-players", room);
  }, [room]);

  useEffect(() => {
    socket.on("send-players", (players) => {
      setPlayers(players);
    });

    //* Connect when refreshing game page
    if (!socket.id) {
      console.log("getting id", location.search.slice(7, 15));
      socket.connect();
      socket.emit("join", location.search.slice(7, 15));
    }

    return () => {
      socket.off("send-players");
    };
  }, []);

  //! Works without strict mode
  // useEffect(() => {
  //   return () => {
  //     console.log("leaving");
  //     socket.emit("leave", room);
  //   };
  // }, [location.search]);

  useEffect(() => {
    return () => {
      console.log("leaving");
      console.log(location.search.slice(7, 15));

      if (location.search.slice(7, 15) !== room) {
        console.log("socket");
        socket.emit("leave", location.search.slice(7, 15));
      }
      room = null;
    };
  }, [location.search]);

  return (
    <div>
      <button onClick={getPlayers}>Cacca</button>
      {players.map(({ id, name }) => {
        return (
          <div>
            <div>{id}</div>
            <div>{name}</div>
          </div>
        );
      })}
      <button onClick={() => getId()}>get ID</button>
      <Game room={room} players={players} />
    </div>
  );
};

export default Lobby;
