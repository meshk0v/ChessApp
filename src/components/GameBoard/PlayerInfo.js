import React from 'react';
import './GameBoard.css'; // Убедитесь, что стили подключены

import pieceImages from './pieceImages';

const groupCapturedPieces = (pieces) => {
  const grouped = {};
  pieces.forEach((piece) => {
    if (!grouped[piece]) {
      grouped[piece] = [];
    }
    grouped[piece].push(piece);
  });
  return Object.values(grouped);
};

const PlayerInfo = ({ avatar, nickname, rank, timeLeft, isOpponent, capturedPieces }) => {
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const groupedPieces = groupCapturedPieces(capturedPieces);

  return (
    <div className={`player-info-container ${isOpponent ? 'opponent' : 'player'}`}>
      <div className="avatar-container1">
        <img src={avatar || 'default-avatar.png'} alt={`${nickname}'s Avatar`} />
      </div>
      <div className="user-info-wrapper">
        <div className="user-info">
          <div className="user-nickname">{nickname}</div>
          <div className="user-rank">
            Rank: {rank}
            {/* Отображаем захваченные фигуры */}
            <div className="captured-pieces">
              {groupedPieces.map((group, index) => (
                <div className="captured-piece-group" key={index}>
                  {group.map((piece, pieceIndex) => (
                    <img
                      key={pieceIndex}
                      src={pieceImages[piece]}
                      alt={`Captured ${piece}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="timer-container">{formatTime(timeLeft)}</div>
      </div>
    </div>
  );
};
export default PlayerInfo;
