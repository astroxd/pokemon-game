import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { socket } from "./socket";
import UserContext from "./UserProvider";

const Game = ({ room, players, changeTimer, gameInfo }) => {
  // const [gameInfo, setGameInfo] = useState();
  const [guess, setGuess] = useState("");

  const { user } = useContext(UserContext);
  // const [timer, setTimer] = useState();

  const [skip, setSkip] = useState(false);
  const [skippers, setSkippers] = useState([0, gameInfo?.points?.length ?? 0]);

  const startGame = () => {
    console.log("stargame");
    socket.emit("start-game", room);
  };

  // const getGameInfo = () => {
  //   console.log("get game info");
  //   socket.emit("get-game-info", room);
  // };

  const checkAnswer = (e) => {
    e.preventDefault();
    setGuess("");
    socket.emit("get-guess", room, socket.id, guess, user);
  };

  const voteSkip = () => {
    setSkip(true);
    socket.emit("get-skip", room);
  };

  useEffect(() => {
    // socket.on("send-game-info", (gameInfo) => {
    //   console.log(gameInfo);
    //   // setGameInfo(gameInfo);
    //   setGuess("");
    // });

    // getGameInfo();
    return () => {
      // socket.off("send-game-info");
    };
  }, []);

  useEffect(() => {
    socket.on("send-timer", (_timer) => {
      changeTimer(_timer);
      console.log(_timer);
    });

    socket.on("send-skip", () => {
      setSkip(false);
    });

    socket.on("send-skippers", (skippers, users) => {
      setSkippers([skippers, users]);
    });

    socket.on("send-messages", (messages) => {
      setMessages(messages);
    });

    return () => {
      socket.off("send-timer");
      socket.off("send-skip");
      socket.off("send-skippers");
    };
  }, []);

  useEffect(() => {
    setSkippers((skippers) => [skippers[0] ?? 0, players.length]);
  }, [players]);

  const [messages, setMessages] = useState([]);

  return (
    <>
      <div className="pokemon flex flex-col p-4 items-center justify-center gap-12 col-span-2">
        {gameInfo?.hasGameEnded ? (
          <div>GAME ENDED</div>
        ) : !gameInfo?.isPlaying ? (
          <button
            onClick={startGame}
            className="px-4 py-2 bg-red-400 rounded hover:rounded-none"
          >
            Start Game
          </button>
        ) : (
          <>
            {skip ? (
              <span className="self-end px-4 py-2 rounded bg-red-400">
                Skipping {skippers[0]} \ {skippers[1]}
              </span>
            ) : (
              <button
                onClick={voteSkip}
                className="self-end px-4 py-2 rounded bg-red-400 "
              >{`Skip ${skippers[0]} \\ ${skippers[1]}`}</button>
            )}
            {gameInfo?.src && (
              <div className="grow">
                <img
                  src={gameInfo.src}
                  alt="cacca"
                  className="h-[450px] max-w-[600px]"
                />
              </div>
            )}
          </>
        )}
      </div>
      <div className="chat-wrapper bg-red-400 flex flex-col">
        <div className="overflow-y-scroll p-4">
          {messages.map(({ user, message, type }) => (
            <p
              className={`!${
                type === "answer" && "bg-rose-800"
              } even:bg-blue-400`}
            >
              {user}: {message}
            </p>
          ))}
        </div>
        <form onSubmit={(e) => checkAnswer(e)} className="mt-auto">
          <input
            type="text"
            placeholder="answer"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            className="py-2 border-2 rounded outline-0"
          />
        </form>
      </div>
    </>
  );
};

export default Game;
