const { v4: uuidv4 } = require("uuid");
const axios = require("axios");
const { Lobby } = require("./Lobby");
const { User } = require("./User");
const io = require("socket.io")(8080, {
  cors: {
    origin: ["http://localhost:3000"],
  },
});

let lobbys = [];

let users = [];
let status = 0;

let gameInfo = {
  src: "",
  points: [],
};
let timer = 30;
let answer = "";

const getPokemon = async (lobby) => {
  lobby.answer = "";

  const randomId = Math.floor(Math.random() * 1000);
  const response = await axios.get(
    `https://pokeapi.co/api/v2/pokemon-species/${randomId}/`
  );
  const { name, names } = response.data;
  const italianName = names.find(
    ({ language }) => language.name === "it"
  )?.name;
  console.log(italianName);
  const answer = italianName?.toLowerCase() ?? name.toLowerCase();
  lobby.answer = answer;
  lobby.src = `https://img.pokemondb.net/artwork/large/${name}.jpg`;
};

io.on("connection", (socket) => {
  socket.on("create-lobby", (name, id) => {
    const lobbyId = uuidv4().substring(0, 8);

    const lobby = new Lobby(lobbyId, name);

    socket.join(lobbyId);
    io.to(lobbyId).emit("receive", lobbyId);

    lobby.addUser(new User(socket.id, "Utente"));

    lobbys.push(lobby);

    // users.push({
    //   room: lobbyId,
    //   users: [
    //     {
    //       id: socket.id,
    //       name: "nome",
    //     },
    //   ],
    // });
  });

  socket.on("get-players", (roomID) => {
    const lobby = getLobbyByCode(roomID);

    const players = lobby.users;

    // const players = users.find(({ room }) => {
    //   return room == roomID;
    // })?.users;
    console.log(players);
    io.to(roomID).emit("send-players", players);
  });

  socket.on("join", (room) => {
    // TODO check if lobby is empty
    socket.join(room);

    const lobby = getLobbyByCode(room);

    lobby.addUser(new User(socket.id, "Utente"));

    io.to(room).emit("receive", room);

    // const index = users.findIndex(({ room }) => room === room);
    // users[index].users = [
    //   ...users[index].users,
    //   {
    //     id: socket.id,
    //     name: "nome",
    //   },
    // ];
  });

  socket.on("get-status", (room) => {
    const lobby = getLobbyByCode(room);
    io.to(room).emit("send-status", lobby.isPlaying);
  });

  socket.on("start-game", async (_room) => {
    console.log("start game");
    const lobby = getLobbyByCode(_room);
    lobby.isPlaying = true;
    startTimer(_room);
    await getPokemon(lobby);

    // const players = users.find(({ room }) => {
    //   return room == _room;
    // })?.users;
    // let gamerPoints = [];
    // players.forEach(({ id }) => gamerPoints.push({ id, points: 0 }));
    // gameInfo.points = gamerPoints;

    // setInterval(() => decreaseTimer(_room), 1000);

    io.to(_room).emit("send-status", lobby.isPlaying);
    io.to(_room).emit("send-game-info", {
      src: lobby.src,
      points: lobby.users,
    });
    io.to(_room).emit("send-timer", lobby.timer);
  });

  socket.on("get-game-info", (room) => {
    const lobby = getLobbyByCode(room);
    if (status === 0) return;
    io.to(room).emit("send-game-info", { src: lobby.src });
  });

  socket.on("get-guess", async (room, _id, guess) => {
    const lobby = getLobbyByCode(room);
    console.log(guess);
    if (guess.toLowerCase() === lobby.answer) {
      const user = lobby.users.find(({ id }) => id === _id);
      user.points += 1;
      // const user = gameInfo.points.findIndex(({ id }) => id === _id);
      // gameInfo.points[user].points = gameInfo.points[user].points + 1;
      await getPokemon(lobby);
      io.to(room).emit("send-game-info", {
        src: lobby.src,
        points: lobby.users,
      });
    }
  });

  // TODO fix timer
  const startTimer = (room) => {
    const lobby = getLobbyByCode(room);
    console.log(lobby);
    setInterval(lobby.decreaseTimer, 1000);
    // console.log("timer", timer);
    // if (timer === "gioco finito") return;
    // if (timer > 0) timer -= 1;
    // else timer = "gioco finito";

    io.to(room).emit("send-timer", lobby.timer);
  };
});

const getLobbyByCode = (code) => {
  const lobby = lobbys.find((lobby) => {
    return lobby.code === code;
  });
  return lobby;
};
