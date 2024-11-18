import React, { useState } from 'react';
import './Profile.css';
import GameHistory from './GameHistory';

const Profile = () => {
  const user = {
    username: 'meshkov_rm',
    rating: 280775,
    gamesPlayed: 154,
    gamesWon: 96,
    winRate: 62.3,
    bestWinStreak: 10,
    maxRating: 290000,
    avgGameTime: '12:34',
    registrationDate: '01.01.2023',
    friendsCount: 15,
  };

  const [showHistory, setShowHistory] = useState(false);

  const openGameHistory = () => {
    setShowHistory(true);
  };

  const closeGameHistory = () => {
    setShowHistory(false);
  };

  if (showHistory) {
    return <GameHistory onBack={closeGameHistory} />;
  }

  return (
    <div className="profile-container">
      {/* Карточка пользователя */}
      <div className="profile-card">
        <div className="avatar-container">
          <div className="avatar-placeholder">{user.username[0]}</div>
        </div>
        <div className="user-info">
          <h2 className="username">{user.username}</h2>
          <div className="rating">{user.rating.toLocaleString()} РЕЙТИНГ</div>
        </div>
      </div>

      {/* Общая статистика */}
      <div className="statistics">
        <div className="stat">
          <div className="stat-label">Сыграно игр</div>
          <div className="stat-value">{user.gamesPlayed}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Победы</div>
          <div className="stat-value">{user.gamesWon}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Процент побед</div>
          <div className="stat-value">{user.winRate}%</div>
        </div>
        <div className="stat">
          <div className="stat-label">Лучшая серия побед</div>
          <div className="stat-value">{user.bestWinStreak}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Максимальный рейтинг</div>
          <div className="stat-value">{user.maxRating.toLocaleString()}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Средняя длина игры</div>
          <div className="stat-value">{user.avgGameTime}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Дата регистрации</div>
          <div className="stat-value">{user.registrationDate}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Количество друзей</div>
          <div className="stat-value">{user.friendsCount}</div>
        </div>
      </div>

      {/* Кнопка перехода к истории */}
      <button className="history-button" onClick={openGameHistory}>
        История игр
      </button>
    </div>
  );
};

export default Profile;
