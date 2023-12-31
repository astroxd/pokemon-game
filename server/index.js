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

const getPokemon = async (lobby) => {
  lobby.answer = "";

  const randomId = Math.floor(Math.random() * 151);
  const response = await axios.get(
    `https://pokeapi.co/api/v2/pokemon/${randomId}/`
  );
  const { name, sprites } = response.data;

  // const italianName = names.find(
  //   ({ language }) => language.name === "it"
  // )?.name;
  // console.log(italianName);

  // const answer = italianName?.toLowerCase() ?? name.toLowerCase();

  lobby.answer = name;
  lobby.src = sprites.other["official-artwork"].front_default;
};

io.on("connection", (socket) => {
  socket.on("create-lobby", (user) => {
    const lobbyId = uuidv4().substring(0, 8);

    const lobby = new Lobby(lobbyId);

    socket.join(lobbyId);
    io.to(lobbyId).emit("receive", lobbyId);

    lobby.addUser(new User(socket.id, user));

    lobbys.push(lobby);
  });

  socket.on("get-players", (roomID) => {
    const lobby = getLobbyByCode(roomID);

    const players = lobby.users;

    console.log("get-players", players);
    io.to(roomID).emit("send-players", players);
  });

  socket.on("join", (room, user) => {
    const lobby = getLobbyByCode(room);
    if (!lobby.users.find((user) => user.id === socket.id)) {
      // TODO check if lobby is empty
      socket.join(room);

      lobby.addUser(new User(socket.id, user));
    }

    io.to(room).emit("receive", room);
  });

  socket.on("leave", (room) => {
    console.log("leaving", room);
    socket.leave(room);

    const clients = io.sockets.adapter.rooms.get(room);
    console.log("clients", clients);

    if (clients === undefined) {
      const idx = lobbys.findIndex((lobby) => lobby.code === room);
      delete lobbys[idx];
      lobbys.splice(idx, 1);
    }
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
    console.log(room);
    const lobby = getLobbyByCode(room);
    // if (!lobby.isPlaying) return;
    sendGameInfo(lobby);
  });

  socket.on("get-guess", async (room, _id, guess, _user) => {
    const lobby = getLobbyByCode(room);
    console.log(guess);
    if (guess.toLowerCase() === lobby.answer) {
      lobby.messages.push({ user: _user, message: guess, type: "answer" });
      io.to(room).emit("send-messages", lobby.messages);
      const user = lobby.users.find(({ id }) => id === _id);
      user.points += 1;
      lobby.users.sort((a, b) => b.points - a.points);
      await getPokemon(lobby);
      sendGameInfo(lobby);
    } else {
      lobby.messages.push({ user: _user, message: guess, type: "wrong" });
      io.to(room).emit("send-messages", lobby.messages);
    }
  });

  socket.on("get-skip", async (room) => {
    const lobby = getLobbyByCode(room);

    lobby.skipping += 1;

    io.to(room).emit("send-skippers", lobby.skipping, lobby.users.length);

    if (lobby.skipping >= Math.ceil(lobby.users.length / 2)) {
      await getPokemon(lobby);
      lobby.skipping = 0;
      sendGameInfo(lobby);
      io.to(room).emit("send-skip");
      io.to(room).emit("send-skippers", lobby.skipping, lobby.users.length);
    }
  });
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
const getLobbyByCode = (code) => {
  const lobby = lobbys.find((lobby) => {
    return lobby.code === code;
  });
  return lobby;
};

const sendGameInfo = (lobby) => {
  io.to(lobby.code).emit("send-game-info", {
    isPlaying: lobby.isPlaying,
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
