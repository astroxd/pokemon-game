import { io } from "socket.io-client";

export const socket = io("http://localhost:8080", {
  autoConnect: false,
});

export const connect = () => {
  socket.connect();
};

export const getId = () => {
  console.log("getID");
  console.log(socket.id);
};
