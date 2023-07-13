import { useCallback, useEffect, useState } from "react";
import { socket } from "./socket";

const Game = ({ room }) => {
  // 0 = pause
  // 1 = playing
  const [isPlaying, setIsPlaying] = useState(false);

  const getGameStatus = useCallback(() => {
    socket.emit("get-status", room);
  }, [room]);

  const startGame = () => {
    console.log("stargame");
    socket.emit("start-game", room);
  };

  const getGameInfo = useCallback(() => {
    console.log("get game info");
    socket.emit("get-game-info", room);
  }, [room]);

  const checkAnswer = (e) => {
    e.preventDefault();
    socket.emit("get-guess", room, socket.id, guess);
  };

  useEffect(() => {
    socket.on("send-status", (status) => {
      console.log(status);
      setIsPlaying(status);
    });
    getGameStatus();

    return () => {
      socket.off("send-status");
    };
  }, [getGameStatus]);

  useEffect(() => {
    socket.on("send-game-info", (gameInfo) => {
      console.log(gameInfo);
      setGameInfo(gameInfo);
      setGuess("");
    });

    if (isPlaying) {
      getGameInfo();
    }
    return () => {
      socket.off("send-game-info");
    };
  }, [isPlaying, getGameInfo]);

  const [gameInfo, setGameInfo] = useState();
  const [guess, setGuess] = useState("");

  const [timer, setTimer] = useState();

  useEffect(() => {
    socket.on("send-timer", (_timer) => {
      setTimer(_timer);
      console.log(_timer);
    });
    return () => {
      socket.off("send-timer");
    };
  }, []);

  return (
    <div>
      {isPlaying ? "true" : "false"}
      {gameInfo?.hasGameEnded ? (
        <div>GAME ENDED</div>
      ) : !isPlaying ? (
        <button onClick={startGame}>Start Game</button>
      ) : (
        <div>
          {gameInfo?.src && <img src={gameInfo.src} alt="cacca" width={200} />}
          <form onSubmit={(e) => checkAnswer(e)}>
            <input
              type="text"
              placeholder="answer"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
            />
          </form>
          Points:{" "}
          {gameInfo?.points?.map(({ id, points }) => (
            <div>
              <span>{id} </span>
              <span>{points}</span>
            </div>
          ))}
          Timer: {timer}
        </div>
      )}
    </div>
  );
};

export default Game;
