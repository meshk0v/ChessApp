import React, { useEffect, useState } from 'react';
import './GameHistory.css';
import axios from 'axios';

const GameHistory = ({ onBack }) => {
  const [gameHistory, setGameHistory] = useState([]);
  const [loading, setLoading] = useState(true); // Состояние загрузки
  const userId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;

  useEffect(() => {
    const fetchGameHistory = async () => {
      try {
        const response = await axios.get(`/api/users/games/history/${userId}`);
        console.log(response)
        setGameHistory(response.data);
      } catch (error) {
        console.error('Ошибка при загрузке истории игр:', error);
      } finally {
        setLoading(false); // Скрываем спиннер после загрузки
      }
    };

    if (userId) {
      fetchGameHistory();
    }

    // Показываем кнопку "Назад"
    window.Telegram?.WebApp?.BackButton.show();
    window.Telegram?.WebApp?.BackButton.onClick(onBack);

    return () => {
      window.Telegram?.WebApp?.BackButton.hide(); // Скрываем кнопку при размонтировании
    };
  }, [onBack, userId]);

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner"></div>
      </div>
    );
  }

  if (gameHistory.length === 0) {
    return (
      <div className="game-history-container">
        <h2>Game history</h2>
        <div className="no-history">No games played yet.</div>
      </div>
    );
  }

  return (
  <div className="game-history-container">
    <h2>Game history</h2>
    <div className="game-history-list">
      {gameHistory.map((game, index) => (
        <div className={`game-history-item ${game.result}`} key={index}>
          <div className="details">
            <div className="opponent">Against: {game.opponent_username || 'Unknown'}</div>
            <div className={`result ${game.result}`}>
              {game.result === 'win' ? 'Win' : game.result === 'draw' ? 'Draw' : 'Lost'}
            </div>
          </div>
          <div className="date">
            {game.start_time
              ? new Date(game.start_time).toLocaleDateString()
              : 'Unknown date'}
          </div>
        </div>
      ))}
    </div>
  </div>
);

};

export default GameHistory;
