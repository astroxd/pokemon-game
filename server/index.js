const { v4: uuidv4 } = require("uuid");
const io = require("socket.io")(8080, {
  cors: {
    origin: ["http://localhost:3000"],
  },
});

let users = [];
let status = 0;
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
      {
        id: socket.id,
        name: "nome",
      },
      ...users[index].users,
    ];
  });

  socket.on("get-status", (room) => {
    io.to(room).emit("send-status", status);
  });

  socket.on("start-game", (room) => {
    status = 1;
    io.to(room).emit("send-status", status);
  });
});
