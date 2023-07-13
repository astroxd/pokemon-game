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

let status = 0;

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
  });

  socket.on("get-players", (roomID) => {
    const lobby = getLobbyByCode(roomID);

    const players = lobby.users;

    console.log("get-players", players);
    io.to(roomID).emit("send-players", players);
  });

  socket.on("join", (room) => {
    // TODO check if lobby is empty
    socket.join(room);

    const lobby = getLobbyByCode(room);

    lobby.addUser(new User(socket.id, "Utente"));

    io.to(room).emit("receive", room);
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

    io.to(_room).emit("send-status", lobby.isPlaying);
    sendGameInfo(lobby);
    io.to(_room).emit("send-timer", lobby.timer);
  });

  socket.on("get-game-info", (room) => {
    const lobby = getLobbyByCode(room);
    if (!lobby.isPlaying) return;
    sendGameInfo(lobby);
  });

  socket.on("get-guess", async (room, _id, guess) => {
    const lobby = getLobbyByCode(room);
    console.log(guess);
    if (guess.toLowerCase() === lobby.answer) {
      const user = lobby.users.find(({ id }) => id === _id);
      user.points += 1;
      await getPokemon(lobby);
      sendGameInfo(lobby);
    }
  });

  const startTimer = (room) => {
    const lobby = getLobbyByCode(room);
    let interval = setInterval(() => {
      lobby.decreaseTimer();
      io.to(room).emit("send-timer", lobby.timer);
      if (lobby.timer === "gioco finito") {
        lobby.hasGameEnded = true;
        lobby.isPlaying = false;
        sendGameInfo(lobby);
        io.to(room).emit("send-status", lobby.isPlaying);
        checkWinner(lobby);
        clearInterval(interval);
      }
    }, 1000);
  };
});

const getLobbyByCode = (code) => {
  const lobby = lobbys.find((lobby) => {
    return lobby.code === code;
  });
  return lobby;
};

const sendGameInfo = (lobby) => {
  io.to(lobby.code).emit("send-game-info", {
    src: lobby.src,
    points: lobby.users,
    hasGameEnded: lobby.hasGameEnded,
  });
};

const checkWinner = (lobby) => {
  const players = lobby.users;
  const max = players.reduce((a, b) => Math.max(a.points, b.points));
  const winner = players.find((player) => player.points === max);
  console.log(winner);
};
