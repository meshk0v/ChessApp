import React, { useEffect, useState } from 'react';
import './Leaderboard.css';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const user = { username: 'meshkov_rm', rating: 280775, rank: 1 };

  useEffect(() => {
    // Загружаем тестовые данные
    const testData = Array.from({ length: 100 }, (_, i) => ({
      username: `Player${i + 1}`,
      rating: Math.floor(Math.random() * 5000) + 1000,
      rank: i + 1,
    })).sort((a, b) => b.rating - a.rating);
    setLeaderboard(testData);

    // Скрыть кнопку Telegram BackButton
    window.Telegram?.WebApp?.BackButton.hide();
  }, []);

  return (
    <div className="leaderboard-container">
      {/* Текущий пользователь */}
      <div className="user-header">
        <div className="user-row">
          <div className="avatar">{user.username[0]}</div>
          <div className="info">
            <div className="username">{user.username}</div>
            <div className="rating">{user.rating.toLocaleString()} РЕЙТИНГ</div>
          </div>
          <div className="rank">#{user.rank}</div>
        </div>
      </div>

      {/* Заголовок списка */}
      <div className="leaderboard-title">
        <h2>Топ игроков</h2>
      </div>

      {/* Список участников */}
      <div className="leaderboard-list">
        {leaderboard.map((player, index) => (
          <div
            className={`player-row ${index < 3 ? 'top-three' : ''}`}
            key={player.rank}
          >
            <div className="player-info">
              <div className="avatar">{player.username[0]}</div>
              <div className="info">
                <div className="username">{player.username}</div>
                <div className="rating">{player.rating.toLocaleString()} РЕЙТИНГ</div>
              </div>
            </div>
            <div className="rank">
              {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${player.rank}`}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
