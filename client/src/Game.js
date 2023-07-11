import { useCallback, useEffect, useState } from "react";
import { socket } from "./socket";

const Game = ({ room }) => {
  // 0 = pause
  // 1 = playing
  const [status, setStatus] = useState(0);

  const getGameStatus = useCallback(() => {
    socket.emit("get-status", room);
  }, [room]);

  const startGame = () => {
    console.log("stargame");
    socket.emit("start-game", room);
  };

  useEffect(() => {
    socket.on("send-status", (status) => {
      setStatus(status);
    });
    getGameStatus();

    return () => {
      socket.off("send-status");
    };
  }, [getGameStatus]);

  return (
    <div>
      {status}
      {status === 0 ? (
        <button onClick={startGame}>Start Game</button>
      ) : (
        <div>game</div>
      )}
    </div>
  );
};

export default Game;
