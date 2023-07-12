const { v4: uuidv4 } = require("uuid");
const axios = require("axios");
const io = require("socket.io")(8080, {
  cors: {
    origin: ["http://localhost:3000"],
  },
});

let users = [];
let status = 0;

let gameInfo = {
  src: "",
  points: [],
};
let timer = 30;
let answer = "";

const getPokemon = async () => {
  answer = "";
  const randomId = Math.floor(Math.random() * 1000);
  const response = await axios.get(
    `https://pokeapi.co/api/v2/pokemon-species/${randomId}/`
  );
  const { name, names } = response.data;
  const italianName = names.find(
    ({ language }) => language.name === "it"
  )?.name;
  console.log(italianName);
  answer = italianName?.toLowerCase() ?? name.toLowerCase();
  gameInfo.src = `https://img.pokemondb.net/artwork/large/${name}.jpg`;
};

io.on("connection", (socket) => {
  socket.on("create-lobby", (name, id) => {
    const lobby = uuidv4().substring(0, 8);
    socket.join(lobby);
    io.to(lobby).emit("receive", lobby);

    users.push({
      room: lobby,
      users: [
        {
          id: socket.id,
          name: "nome",
        },
      ],
    });
  });

  socket.on("get-players", (roomID) => {
    const players = users.find(({ room }) => {
      return room == roomID;
    })?.users;
    io.to(roomID).emit("send-players", players);
    console.log(users);
  });

  socket.on("join", (room) => {
    socket.join(room);
    io.to(room).emit("receive", room);

    const index = users.findIndex(({ room }) => room === room);
    users[index].users = [
      ...users[index].users,
      {
        id: socket.id,
        name: "nome",
      },
    ];
  });

  socket.on("get-status", (room) => {
    io.to(room).emit("send-status", status);
  });

  socket.on("start-game", async (_room) => {
    status = 1;
    await getPokemon();
    const players = users.find(({ room }) => {
      return room == _room;
    })?.users;
    let gamerPoints = [];
    players.forEach(({ id }) => gamerPoints.push({ id, points: 0 }));
    gameInfo.points = gamerPoints;

    setInterval(() => decreaseTimer(_room), 1000);

    io.to(_room).emit("send-status", status);
    io.to(_room).emit("send-game-info", gameInfo);
    io.to(_room).emit("send-timer", timer);
  });

  socket.on("get-game-info", (room) => {
    if (status === 0) return;
    io.to(room).emit("send-game-info", gameInfo);
  });

  socket.on("get-guess", async (room, _id, guess) => {
    console.log(guess);
    if (guess.toLowerCase() === answer) {
      const user = gameInfo.points.findIndex(({ id }) => id === _id);
      gameInfo.points[user].points = gameInfo.points[user].points + 1;
      await getPokemon();
      io.to(room).emit("send-game-info", gameInfo);
    }
  });

  const decreaseTimer = (room) => {
    console.log("timer", timer);
    if (timer === "gioco finito") return;
    if (timer > 0) timer -= 1;
    else timer = "gioco finito";

    io.to(room).emit("send-timer", timer);
  };
});
