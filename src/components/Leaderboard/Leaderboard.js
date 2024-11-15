// src/components/Leaderboard.js
import React, { useEffect } from 'react';
import './Leaderboard.css'; // Импортируем CSS для стилей

const Leaderboard = () => {
  useEffect(() => {
    window.Telegram.WebApp.BackButton.hide(); // Скрываем кнопку "Назад" при размонтировании
  }, []);

  return (
    <div className="leaderboard-container">
      <h2>Soon</h2>
    </div>
  );
};

export default Leaderboard;
