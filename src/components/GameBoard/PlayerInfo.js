import React from 'react';
import './GameBoard.css'; // Создайте файл стилей, если он нужен

const PlayerInfo = ({ avatar, nickname, rank, timeLeft, isOpponent }) => {
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <div className={`player-info-container ${isOpponent ? 'opponent' : 'player'}`}>
      <div className="avatar-container1">
        <img src={avatar || 'default-avatar.png'} alt={`${nickname}'s Avatar`} />
      </div>
      <div className="user-info-wrapper">
        <div className="user-info">
          <div className="user-nickname">{nickname}</div>
          <div className="user-rank">Rank: {rank}</div>
        </div>
        <div className="timer-container">{formatTime(timeLeft)}</div>
        
      </div>
    </div>
  );
};

export default PlayerInfo;
