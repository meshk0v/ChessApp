import React, { useEffect, useState } from 'react';
import './GameHistory.css';

const GameHistory = ({ onBack }) => {
  const [gameHistory, setGameHistory] = useState([]);

  useEffect(() => {
    // Загружаем тестовые данные истории игр
    const testGames = Array.from({ length: 50 }, (_, i) => ({
      opponent: `Player${i + 1}`,
      result: i % 2 === 0 ? 'win' : 'loss',
      date: new Date(Date.now() - i * 86400000).toLocaleDateString(),
    }));
    setGameHistory(testGames);

    // Показываем кнопку "Назад"
    window.Telegram?.WebApp?.BackButton.show();
    window.Telegram?.WebApp?.BackButton.onClick(onBack);

    return () => {
      window.Telegram?.WebApp?.BackButton.hide(); // Скрываем кнопку при размонтировании
    };
  }, [onBack]);

  return (
    <div className="game-history-container">
      <h2>История игр</h2>
      <div className="game-history-list">
        {gameHistory.map((game, index) => (
          <div className={`game-history-item ${game.result}`} key={index}>
            <div className="details">
              <div className="opponent">Против: {game.opponent}</div>
              <div className={`result ${game.result}`}>
                {game.result === 'win' ? 'Победа' : 'Поражение'}
              </div>
            </div>
            <div className="date">{game.date}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameHistory;
