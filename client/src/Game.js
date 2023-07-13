import { useCallback, useEffect, useState } from "react";
import { socket } from "./socket";

const Game = ({ room, players }) => {
  const [gameInfo, setGameInfo] = useState();
  const [guess, setGuess] = useState("");
  const [timer, setTimer] = useState();

  const [skip, setSkip] = useState(false);
  const [skippers, setSkippers] = useState([0, gameInfo?.points?.length ?? 0]);

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

  const voteSkip = () => {
    setSkip(true);
    socket.emit("get-skip", room);
  };

  useEffect(() => {
    socket.on("send-game-info", (gameInfo) => {
      console.log(gameInfo);
      setGameInfo(gameInfo);
      setGuess("");
    });

    getGameInfo();
    return () => {
      socket.off("send-game-info");
    };
  }, [getGameInfo]);

  useEffect(() => {
    socket.on("send-timer", (_timer) => {
      setTimer(_timer);
      console.log(_timer);
    });

    socket.on("send-skip", () => {
      setSkip(false);
    });

    socket.on("send-skippers", (skippers, users) => {
      setSkippers([skippers, users]);
    });

    return () => {
      socket.off("send-timer");
      socket.off("send-skip");
      socket.off("send-skippers");
    };
  }, []);

  return (
    <div>
      {gameInfo?.isPlaying ? "true" : "false"}
      {gameInfo?.hasGameEnded ? (
        <div>GAME ENDED</div>
      ) : !gameInfo?.isPlaying ? (
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
          {skip ? (
            `Skipping ${skippers[0]} \\ ${skippers[1]}`
          ) : (
            <button
              onClick={voteSkip}
            >{`Skip ${skippers[0]} \\ ${players.length}`}</button>
          )}
        </div>
      )}
    </div>
  );
};

export default Game;
