// src/socket.js
import { io } from "socket.io-client";

const socket = io("https://chess-battle.space");

socket.on('connect', () => {
  console.log("WebSocket подключен:", socket.id);
});

socket.on('disconnect', (reason) => {
  console.log("WebSocket отключен. Причина:", reason);
});

export default socket;
