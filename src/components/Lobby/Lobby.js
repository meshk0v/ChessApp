import React, { useState, useEffect } from 'react';
import socket from '../../socket';
import { useNavigate } from 'react-router-dom';
import './Lobby.css';
import GameBoard from '../GameBoard/GameBoard';
import Invitation from './Invitation/Invitation';
import ButtonGroup from './ButtonGroup/ButtonGroup';
import TimeSelection from './TimeSelection/TimeSelection';
import axios from 'axios';

const Lobby = ({ setBottomNavVisible, resetLobbyState }) => {
  const [gameId, setGameId] = useState(sessionStorage.getItem('gameId') || null);
  const [playerJoined, setPlayerJoined] = useState(sessionStorage.getItem('playerJoined') === 'true');
  const [invitationLink, setInvitationLink] = useState('');
  const [waitingMessage, setWaitingMessage] = useState('');
  const [showTimeSelection, setShowTimeSelection] = useState(false);
  const [color, setColor] = useState('white');
  const [isRandomGame, setIsRandomGame] = useState(false);
  const [isWaitingForOpponent, setIsWaitingForOpponent] = useState(false);
  const navigate = useNavigate();
  const userId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
  // Сброс состояния при изменении resetLobbyState
  useEffect(() => {
    if (resetLobbyState) {
      sessionStorage.removeItem('gameId');
      sessionStorage.removeItem('playerJoined');
      setGameId(null);
      setPlayerJoined(false);
      setWaitingMessage('');
      setInvitationLink('');
      setIsRandomGame(false);
      setIsWaitingForOpponent(false);
      setShowTimeSelection(false);
    }
  }, [resetLobbyState]);

    // Добавляем пользователя в базу данных
  const addUserToDatabase = async () => {
    if (!userId) return;

    try {
      // Отправляем запрос на сервер для проверки и добавления пользователя
      await axios.post('/api/users/check-or-add-user', {
        telegram_id: userId, // Уникальный идентификатор пользователя Telegram
        username: window.Telegram.WebApp?.initDataUnsafe?.user?.username || 'unknown',
        first_name: window.Telegram.WebApp?.initDataUnsafe?.user?.first_name || 'unknown',
        last_name: window.Telegram.WebApp?.initDataUnsafe?.user?.last_name || 'unknown',
        avatar_url: window.Telegram.WebApp?.initDataUnsafe?.user?.photo_url || null,
      });

      console.log('User checked/added successfully.');
    } catch (error) {
      console.error('Error adding user to the database:', error);
    }
  };

  // Выполняем добавление пользователя при первом рендере
  useEffect(() => {
    addUserToDatabase();
  }, [userId]);

 useEffect(() => {
    const storedGameId = sessionStorage.getItem('gameId');
    const storedPlayerJoined = sessionStorage.getItem('playerJoined') === 'true';
    if (storedGameId) setGameId(storedGameId);
    if (storedPlayerJoined) setPlayerJoined(storedPlayerJoined);
  }, []);
  
  const handleLeaveGame = () => {
    sessionStorage.removeItem('gameId');
    sessionStorage.removeItem('playerJoined');
    setGameId(null);
    setPlayerJoined(false);
    setWaitingMessage('');
    setInvitationLink('');
    setIsRandomGame(false);
    setIsWaitingForOpponent(false);
    setShowTimeSelection(false);
    window.Telegram.WebApp.BackButton.hide();
    navigate('/');
  };

  const joinRandomGame = (time) => {
    setIsWaitingForOpponent(true);
    setWaitingMessage('Waiting for opponent...');
    socket.emit('findRandomGame', { time, userId });
  };

  // Устанавливаем обработчики событий сокета
  useEffect(() => {
    socket.on('startGame', (data) => {
      window.Telegram.WebApp.BackButton.show();
      setColor(data.color);
      setGameId(data.gameId);
      sessionStorage.setItem('gameId', data.gameId);
    });

    socket.on('assignColor', (data) => {
      setColor(data.color);
    });

    socket.on('playerJoined', (data) => {
      setPlayerJoined(true);
      setGameId(data.gameId);
      sessionStorage.setItem('playerJoined', 'true');
      sessionStorage.setItem('gameId', data.gameId);
      setIsWaitingForOpponent(false);
    });

    socket.on('errorMessage', (data) => {
      alert(data.message);
      setIsWaitingForOpponent(false);
      handleLeaveGame();
    });

    return () => {
      socket.off('startGame');
      socket.off('assignColor');
      socket.off('playerJoined');
      socket.off('gameStart');
      socket.off('errorMessage');
    };
  }, [navigate]); 

  useEffect(() => {
    const handleBackPress = () => {
      const currentGameId = sessionStorage.getItem('gameId');
      if (currentGameId) {
        socket.emit('leaveGame', { gameId: currentGameId, userId });
      }
      handleLeaveGame();
    };

    const tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand();
    tg.disableVerticalSwipes();
    tg.BackButton.onClick(handleBackPress);

    // Обработка URL параметров
    const initData = window.Telegram.WebApp.initData;
    const urlParams = new URLSearchParams(initData);
    const startParam = urlParams.get('start_param');

    if (startParam && startParam.startsWith('game_')) {
      joinGame(startParam);
    }

    return () => {
      tg.BackButton.offClick(handleBackPress);
    };
  }, [userId]);

  const createGame = (isRandom = false, time) => {
    const id = `game_${Math.random().toString(36).substr(2, 9)}`;
    setGameId(id);
    sessionStorage.setItem('gameId', id);
    setIsRandomGame(isRandom);
    socket.emit('createGame', { id, time, userId });

    if (isRandom) {
      setWaitingMessage('Waiting for opponent...');
      setIsWaitingForOpponent(true);
    } else {
      const link = `https://t.me/Chess_Battle_Bot/startapp?startapp=${id}`;
      setInvitationLink(link);
      window.Telegram.WebApp.BackButton.show();
    }
  };

  const handleTimeSelection = (time) => {
    if (isRandomGame) {
      joinRandomGame(time);
    } else {
      createGame(false, time);
    }
    setShowTimeSelection(false);
  };

  const joinGame = (id) => {
    if (!id) {
      console.error("Ошибка: gameId не определен при подключении.");
      return;
    }

    if (sessionStorage.getItem('requestSent') === 'true') return;
    sessionStorage.setItem('requestSent', 'true');
    sessionStorage.setItem('gameId', id);
    window.Telegram.WebApp.BackButton.show();


    setIsWaitingForOpponent(true);
    setWaitingMessage('Waiting for opponent...');
    socket.emit('joinGame', { gameId: id, userId });
  };

  const copyToClipboard = () => {
    try {
      navigator.clipboard.writeText(invitationLink).then(() => {
        alert('Link copied');
      }).catch(() => {
        alert('Failed to copy. Please copy the link manually: ' + invitationLink);
      });
    } catch (error) {
      alert('Failed to copy. Please copy the link manually: ' + invitationLink);
    }
  };

  useEffect(() => {
    setBottomNavVisible(!playerJoined);
  }, [playerJoined, setBottomNavVisible]);

  const handleInviteClick = () => {
    if (gameId) {
      const url = `https://t.me/Chess_Battle_Bot/startapp?startapp=${gameId}`;
      const text = 'Join the game bro!';
      const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
      window.open(shareUrl, '_blank');
    } else {
      alert('First, create a game to share the invitation.');
    }
  };

  return (
    <div className="lobby-container">
    {!isRandomGame && 
     !showTimeSelection && 
     !isWaitingForOpponent && 
     !(gameId && playerJoined) && (
      <div className="telegram-icon" onClick={() => window.open('https://t.me/ChessBattle_EN', '_blank')}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="none">
          <circle cx="16" cy="16" r="14" fill="url(#telegram-gradient)" />
          <path d="M22.9866 10.2088C23.1112 9.40332 22.3454 8.76755 21.6292 9.082L7.36482 15.3448C6.85123 15.5703 6.8888 16.3483 7.42147 16.5179L10.3631 17.4547C10.9246 17.6335 11.5325 17.541 12.0228 17.2023L18.655 12.6203C18.855 12.4821 19.073 12.7665 18.9021 12.9426L14.1281 17.8646C13.665 18.3421 13.7569 19.1512 14.314 19.5005L19.659 22.8523C20.2585 23.2282 21.0297 22.8506 21.1418 22.1261L22.9866 10.2088Z" fill="white" />
          <defs>
            <linearGradient id="telegram-gradient" x1="16" y1="2" x2="16" y2="30" gradientUnits="userSpaceOnUse">
              <stop stopColor="#37BBFE" />
              <stop offset="1" stopColor="#007DBB" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    )}
      {isWaitingForOpponent ? (
        <div className="waiting-message">
          <h2>{waitingMessage}</h2>
        </div>
      ) : gameId && playerJoined ? (

<GameBoard
  gameId={gameId}
  playerColor={color}
  resetGame={handleLeaveGame}
  updateGameDetails={(newGameId, newColor) => {
    setGameId(newGameId); // Обновление gameId
    setColor(newColor);   // Обновление цвета
  }}
/>


        // <GameBoard gameId={gameId} playerColor={color} resetGame={handleLeaveGame} />
      ) : (
        <>
          {!isRandomGame && gameId ? (
            <Invitation 
              gameId={gameId} 
              invitationLink={invitationLink} 
              onCopy={copyToClipboard} 
              onShare={handleInviteClick} 
              playerJoined={playerJoined} 
            />
          ) : (
            !showTimeSelection && !isWaitingForOpponent ? (
              <ButtonGroup
                onFriendGameClick={() => {
                  setShowTimeSelection(true);
                  setIsRandomGame(false);
                  window.Telegram.WebApp.BackButton.show();
                }}
                onRandomGameClick={() => {
                  setShowTimeSelection(true);
                  setIsRandomGame(true);
                  window.Telegram.WebApp.BackButton.show();
                }}
              />
            ) : (
              <TimeSelection onSelectTime={handleTimeSelection} />
            )
          )}
        </>
      )}
    </div>
  );
};

export default Lobby;
