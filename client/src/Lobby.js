import { useCallback, useEffect, useMemo, useState } from "react";
import { getId, socket } from "./socket";
import { useLocation } from "react-router-dom";
import Game from "./Game";

const Lobby = () => {
  const location = useLocation();
  const room = location.search.slice(7, 15);

  const [players, setPlayers] = useState([]);

  const getPlayers = useMemo(() => {
    console.log("get players", room);
    socket.emit("get-players", room);
  }, [room]);

  useEffect(() => {
    socket.on("send-players", (players) => {
      setPlayers(players);
    });
    return () => {
      socket.off("send-players");
    };
  }, []);

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
      <Game room={room} />
    </div>
  );
};

export default Lobby;
