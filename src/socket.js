// src/socket.js
import { io } from "socket.io-client";

const socket = io("https://chess-battle.space", {
  // Подписанные данные Telegram — бэкенд по ним проверяет, кто подключился
  auth: { initData: window.Telegram?.WebApp?.initData || '' },
});

socket.on('connect_error', (err) => {
  console.error("WebSocket: ошибка подключения:", err.message);
});

socket.on('connect', () => {
  console.log("WebSocket подключен:", socket.id);
});

socket.on('disconnect', (reason) => {
  console.log("WebSocket отключен. Причина:", reason);
});

export default socket;
