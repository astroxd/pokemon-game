import { useCallback, useEffect, useMemo, useState } from "react";
import { getId, socket } from "./socket";
import { useLocation } from "react-router-dom";
import Game from "./Game";

const Lobby = () => {
  const location = useLocation();
  let room = location.search.slice(7, 15);

  const [players, setPlayers] = useState([]);
  const [gameInfo, setGameInfo] = useState();

  const [timer, setTimer] = useState(145);
  const changeTimer = (timer) => {
    setTimer(timer);
  };

  const getGameInfo = () => {
    socket.emit("get-game-info", room);
  };

  useEffect(() => {
    socket.on("send-players", (players) => {
      setPlayers(players);
    });
    socket.on("send-game-info", (gameInfo) => {
      console.log(gameInfo);
      setGameInfo(gameInfo);
    });

    if (room) {
      getGameInfo();
    }

    //* Connect when refreshing game page
    if (!socket.id) {
      console.log("getting id", location.search.slice(7, 15));
      socket.connect();
      socket.emit("join", location.search.slice(7, 15));
    }

    return () => {
      socket.off("send-players");
    };
  }, [room]);

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
    <div className="lobby mt-12 mx-12 grid grid-cols-4 gap-4 grid-rows-[auto_100%]">
      {/* <button onClick={getPlayers}>Cacca</button> */}
      <div className="col-span-full bg-blue-400 flex justify-center py-2 px-4 relative">
        <span className="absolute left-4">{timer}</span>
        <span className="">Nome Lobby</span>
      </div>
      <div className="players">
        <ul>
          {gameInfo?.points?.map(({ id, name, points }, idx) => {
            return (
              <li className="flex gap-2 p-4 border-2 border-blue-900 rounded">
                <div className="flex-none">#{idx + 1}</div>
                <div className="grow text-center bg-blue-400">{name}</div>
                <div className="flex-none">{points}</div>
              </li>
            );
          })}
        </ul>
      </div>

      <Game
        room={room}
        players={players}
        changeTimer={changeTimer}
        gameInfo={gameInfo}
      />
    </div>
  );
};

export default Lobby;
