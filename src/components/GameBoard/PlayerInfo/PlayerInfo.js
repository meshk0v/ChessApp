import React, { useState, useEffect, useRef } from 'react';
import './PlayerInfo.css';

import pieceImages from '../pieceImages';

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

const PlayerInfo = ({
  avatar,
  nickname,
  rank,
  timeLeft,
  isOpponent,
  capturedPieces,
  disconnectCountdown,
  socket,
  gameId,
  playerId,
}) => {
  const [currentEmotion, setCurrentEmotion] = useState(null); // Текущая эмоция
  const [showEmotions, setShowEmotions] = useState(false); // Показывать список эмоций
  const userId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;

  const emotionTimeoutRef = useRef(null); // Таймер для текущей эмоции
  const closeListTimeoutRef = useRef(null); // Таймер для скрытия списка эмоций

  const emotionsList = ['😀', '😢', '😡', '🎉', '👍']; // Список эмоций
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };  
  // Показываем эмоцию и запускаем таймер на скрытие
  const handleEmotionClick = (emotion) => {
    if (socket && gameId) {
      socket.emit('sendEmotion', { gameId, senderId: userId, emotion });
      displayEmotion(emotion); // Локальное отображение эмоции
    }
  };

  // Отображение эмоции локально
  const displayEmotion = (emotion) => {
    // Сбрасываем старый таймер для эмоции
    if (emotionTimeoutRef.current) {
      clearTimeout(emotionTimeoutRef.current);
    }

    // Устанавливаем новую эмоцию
    setCurrentEmotion(emotion);

    // Таймер на скрытие эмоции
    emotionTimeoutRef.current = setTimeout(() => {
      setCurrentEmotion(null);
    }, 3000);
  };

  // Показываем список эмоций
  const handleAvatarClick = () => {
    setShowEmotions(true); // Показываем меню
    resetCloseListTimer(); // Перезапускаем таймер на 5 секунд
  };

  // Таймер на скрытие списка эмоций
  const resetCloseListTimer = () => {
    if (closeListTimeoutRef.current) {
      clearTimeout(closeListTimeoutRef.current);
    }

    closeListTimeoutRef.current = setTimeout(() => {
      setShowEmotions(false); // Скрываем список
    }, 5000); // Таймер на 5 секунд
  };

  // Логика при получении эмоции от другого игрока
  useEffect(() => {
    if (socket) {
      socket.on('receiveEmotion', ({ senderId, emotion }) => {
        if (senderId === userId && !isOpponent) {
          // Если это текущий игрок
          displayEmotion(emotion);
        } else if (isOpponent && senderId !== userId) {
          // Если это оппонент
          displayEmotion(emotion);
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('receiveEmotion');
      }

      // Очистка таймеров при размонтировании компонента
      if (emotionTimeoutRef.current) {
        clearTimeout(emotionTimeoutRef.current);
      }

      if (closeListTimeoutRef.current) {
        clearTimeout(closeListTimeoutRef.current);
      }
    };
  }, [socket, userId, isOpponent]);

  const groupedPieces = groupCapturedPieces(capturedPieces);

  return (
    <div className={`player-info-container ${isOpponent ? 'opponent' : 'player'}`}>
      <div
        className="avatar-container1"
        onClick={handleAvatarClick} // Показать меню при клике на аватар
      >
        <img src={avatar || 'default-avatar.png'} alt={`${nickname}'s Avatar`} />
        {currentEmotion && <div className="emotion-overlay">{currentEmotion}</div>}
      </div>
      {showEmotions && !isOpponent && (
        <div
          className="emotions-list"
          onMouseEnter={resetCloseListTimer} // Перезапуск таймера при наведении
          onMouseLeave={resetCloseListTimer} // Перезапуск таймера при уходе мыши
        >
          {emotionsList.map((emotion, index) => (
            <span
              key={index}
              className="emotion"
              onClick={() => {
                handleEmotionClick(emotion); // Выбор эмоции
                resetCloseListTimer(); // Перезапуск таймера
              }}
            >
              {emotion}
            </span>
          ))}
        </div>
      )}
      <div className="user-info-wrapper">
        <div className="user-info">
          <div className="user-nickname">{nickname}</div>
          <div className="user-rank">Rank: {rank}</div>
          <div className="captured-pieces">
            {Object.entries(groupedPieces).map(([piece, count], index) => (
              <div className="captured-piece-group" key={index}>
                {Array.from({ length: count }).map((_, i) => (
                  <img
                    key={i}
                    src={pieceImages[piece]}
                    alt={`Captured ${piece}`}
                    className="captured-piece"
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        {isOpponent && disconnectCountdown !== null && (
          <div className="disconnect-timer">
            <p>Противник отключен</p>
            <div className="disconnect-progress-bar">
              <div
                className="disconnect-progress"
                style={{
                  width: `${(disconnectCountdown / 10) * 100}%`,
                  transition: 'width 1s linear',
                }}
              ></div>
            </div>
          </div>
        )}
        <div className="timer-container">{formatTime(timeLeft)}</div>
      </div>
    </div>
  );
};

export default PlayerInfo;
