import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Leaderboard.css';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const userId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
 const [loading, setLoading] = useState(true); // Индикатор загрузки

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        // Запрашиваем данные лидерборда
        const response = await axios.get('/api/users/leaderboard');
        setLeaderboard(response.data);

        // Ищем текущего пользователя в лидерборде
        const user = response.data.find((player) => player.telegram_id === userId);
        if (user) {
          setCurrentUser(user);
        }
      } catch (error) {
        console.error('Ошибка при загрузке лидерборда:', error);
      } finally {
        setLoading(false); // Данные загрузились
      }
    };

    fetchLeaderboard();

    // Скрыть Telegram BackButton
    window.Telegram?.WebApp?.BackButton.hide();
  }, [userId]);

  return (
    <div className="leaderboard-container">
      {/* Показываем спиннер, если данные еще загружаются */}
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}

      {/* Текущий пользователь */}
      {!loading && currentUser && (
        <div className="user-header">
          <div className="user-row">
            <div className="avatar">
              {currentUser.avatar_url ? (
                <img src={currentUser.avatar_url} alt="Avatar" />
              ) : (
                <div className="avatar-placeholder">
                  {currentUser.username ? currentUser.username[0] : '?'}
                </div>
              )}
            </div>
            <div className="info">
              <div className="username">{currentUser.username || 'Unknown'}</div>
              <div className="rating">
                {currentUser.rating?.toLocaleString() || 'N/A'} rank
              </div>
            </div>
            <div className="rank">#{currentUser.rank}</div>
          </div>
        </div>
      )}

      {/* Заголовок списка */}
      {!loading && (
        <div className="leaderboard-title">
          <h2>Top players</h2>
        </div>
      )}

      {/* Список участников */}
      {!loading && (
        <div className="leaderboard-list">
          {leaderboard.map((player, index) => (
            <div
              className={`player-row ${index < 3 ? 'top-three' : ''}`}
              key={player.telegram_id || index}
            >
              <div className="player-info">
                <div className="avatar">
                  {player.avatar_url ? (
                    <img src={player.avatar_url} alt="Avatar" />
                  ) : (
                    <div className="avatar-placeholder">
                      {player.username ? player.username[0] : '?'}
                    </div>
                  )}
                </div>
                <div className="info">
                  <div className="username">{player.username || 'Unknown'}</div>
                  <div className="rating">
                    {player.rating ? player.rating.toLocaleString() : 'N/A'} rank
                  </div>
                </div>
              </div>
              <div className="rank">
                {index === 0
                  ? '🥇'
                  : index === 1
                  ? '🥈'
                  : index === 2
                  ? '🥉'
                  : `#${index + 1}`}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
