import React, { useState, useEffect } from 'react';
import socket from '../../socket';
import { useNavigate } from 'react-router-dom';
import './Lobby.css';
import GameBoard from '../GameBoard/GameBoard';
import Invitation from './Invitation/Invitation';
import ButtonGroup from './ButtonGroup/ButtonGroup';
import TimeSelection from './TimeSelection/TimeSelection';

const Lobby = ({ setBottomNavVisible }) => {
  const [gameId, setGameId] = useState(sessionStorage.getItem('gameId') || null);
  const [playerJoined, setPlayerJoined] = useState(sessionStorage.getItem('playerJoined') === 'true');
  const [invitationLink, setInvitationLink] = useState('');
  const [waitingMessage, setWaitingMessage] = useState('');
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [showTimeSelection, setShowTimeSelection] = useState(false);
  const [color, setColor] = useState('white');
  const [isRandomGame, setIsRandomGame] = useState(false);
  const [isWaitingForOpponent, setIsWaitingForOpponent] = useState(false);
  const navigate = useNavigate();
  const userId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;

  // Синхронизируем `gameId` и `playerJoined` с `sessionStorage`
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
    setIsGameStarted(false);
    setIsRandomGame(false);
    setIsWaitingForOpponent(false);
    setShowTimeSelection(false);
    window.Telegram.WebApp.BackButton.hide();
    navigate('/');
  };

  const joinRandomGame = (time) => {
    setIsWaitingForOpponent(true);
    setWaitingMessage('Ожидание соперника...');
    socket.emit('findRandomGame', { time, userId });
  };

  // Устанавливаем обработчики событий сокета
  useEffect(() => {
    socket.on('startGame', (data) => {
      setIsGameStarted(true);
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

    socket.on('gameStart', () => {
      setIsGameStarted(true);
    });

    socket.on('opponentDisconnected', (data) => {
      alert(data.message);
      handleLeaveGame();
    });

    socket.on('gameEnded', (data) => {
      alert(data.message);
      handleLeaveGame();
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
      socket.off('opponentDisconnected');
      socket.off('gameEnded');
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
    setIsGameStarted(true);
    setIsRandomGame(isRandom);
    socket.emit('createGame', { id, time, userId });

    if (isRandom) {
      setWaitingMessage('Ожидание другого игрока...');
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
    setWaitingMessage('Ожидание соперника...');
    socket.emit('joinGame', { gameId: id, userId });
  };

  const copyToClipboard = () => {
    try {
      navigator.clipboard.writeText(invitationLink).then(() => {
        alert('Ссылка скопирована');
      }).catch(() => {
        alert('Не удалось скопировать. Скопируйте ссылку вручную: ' + invitationLink);
      });
    } catch (error) {
      alert('Не удалось скопировать. Скопируйте ссылку вручную: ' + invitationLink);
    }
  };

  useEffect(() => {
    setBottomNavVisible(!playerJoined);
  }, [playerJoined, setBottomNavVisible]);

  const handleInviteClick = () => {
    if (gameId) {
      const url = `https://t.me/Chess_Battle_Bot/startapp?startapp=${gameId}`;
      const text = 'Присоединяйся к игре!';
      const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
      window.open(shareUrl, '_blank');
    } else {
      alert('Сначала создайте игру, чтобы поделиться приглашением.');
    }
  };

  return (
    <div className="lobby-container">
      {isWaitingForOpponent ? (
        <div className="waiting-message">
          <h2>{waitingMessage}</h2>
        </div>
      ) : gameId && playerJoined ? (
        <GameBoard gameId={gameId} playerColor={color} resetGame={handleLeaveGame} />
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
