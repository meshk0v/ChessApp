import React, { useEffect, useState } from 'react';
import './GameBoard.css';
import socket from '../../socket';

import axios from 'axios';
import pieceImages from './pieceImages';
import initialBoard from './initialBoard';
import Modal from './Modal/MenuModal/MenuModal';
import DrawOfferModal from './Modal/DrawOfferModal/DrawOfferModal';
import PlayerInfo from './PlayerInfo/PlayerInfo';
import ChessBoard from './ChessBoard/ChessBoard';
import { Chess } from 'chess.js';
import ResultModal from './Modal/ResultModal/ResultModal';


const GameBoard = ({ gameId, playerColor, resetGame, updateGameDetails }) => {
  const [chess, setChess] = useState(new Chess());
  const [board, setBoard] = useState(initialBoard);
  const [isMyTurn, setIsMyTurn] = useState(playerColor === 'white'); // Белые ходят первыми
  const [userAvatar, setUserAvatar] = useState(null);
  const [opponentAvatar, setOpponentAvatar] = useState(null);
  const userId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
  const [showModal, setShowModal] = useState(false);
  const [timeoutModal, setTimeoutModal] = useState(null); // Уведомление о времени
  const [timeLeft, setTimeLeft] = useState({ white: null, black: null });
  const [drawOfferModal, setDrawOfferModal] = useState(null); // Хранит сообщение о предложении ничьей
  const [alertMessage, setAlertMessage] = useState(null);
  const [lastMove, setLastMove] = useState(null); // Состояние для последнего хода
  const [capturedByPlayer, setCapturedByPlayer] = useState([]); // Фигуры, захваченные игроком
  const [capturedByOpponent, setCapturedByOpponent] = useState([]); // Фигуры, захваченные оппонентом
  const [resultModal, setResultModal] = useState(null); // Хранит информацию о результате игры
  const [isRematchRequested, setRematch] = useState(null); // Хранит информацию о результате игры
  const [opponentDisconnectTimer, setOpponentDisconnectTimer] = useState(null);

  useEffect(() => {
  socket.on('syncTime', ({ timeLeft }) => {
    if (resultModal) {
      console.log("[CLIENT] Ignoring syncTime: Game is over.");
      return;
    }
    console.log('[CLIENT] Sync Time Received:', timeLeft);

    setTimeLeft((prevTimeLeft) => {
      if (!prevTimeLeft) return timeLeft;

      // Проверяем отклонения времени
      const whiteDiff = Math.abs(timeLeft.white - prevTimeLeft.white);
      const blackDiff = Math.abs(timeLeft.black - prevTimeLeft.black);

      if (whiteDiff > 1 || blackDiff > 1) {
        console.log('[CLIENT] Time difference detected, syncing...');
        return timeLeft;
      }

      return prevTimeLeft; // Если разницы нет, сохраняем текущее состояние
    });
  });

  return () => socket.off('syncTime');
}, [resultModal]); // Добавили зависимость от `resultModal`

useEffect(() => {
  const smoothTimer = setInterval(() => {
    setTimeLeft((prevTimeLeft) => {
      if (!prevTimeLeft || resultModal) {
        console.log("[CLIENT] Timer paused: Game is over.");
        return prevTimeLeft;
      }

      const updatedTime = { ...prevTimeLeft };
      const currentColor = isMyTurn ? playerColor : (playerColor === 'white' ? 'black' : 'white');

      if (updatedTime[currentColor] > 0) {
        updatedTime[currentColor] -= 1;
      }

      return updatedTime;
    });
  }, 1000);

  return () => clearInterval(smoothTimer);
}, [isMyTurn, playerColor, resultModal]);

  const handleCloseTimeoutModal = () => {
      setTimeoutModal(null);
      resetGame();
    };
  
  const toggleModal = () => {
    setShowModal(!showModal);
  };

  useEffect(() => {
    const fetchAvatar = async (id, setAvatar) => {
      try {
          const response = await axios.get(`https://chess-battle.space/api/get_telegram_avatar/${id}`);
          setAvatar(response.data.avatar_url);
      } catch (error) {
        console.error('Ошибка при получении аватарки:', error);
      }
    };

    if (userId) {
      fetchAvatar(userId, setUserAvatar);
    }

    // Запрашиваем информацию о сопернике сразу после монтирования компонента
    socket.emit('requestOpponentInfo', { gameId });

    // Слушаем информацию о сопернике
    socket.on('opponentInfo', ({ opponentId }) => {
      console.log("Оппонент ID:", opponentId); // Проверка
      fetchAvatar(opponentId, setOpponentAvatar);
    });

    return () => {
      socket.off('opponentInfo');
    };
  }, [userId, gameId]);


  const transformBoardData = (boardData) => {
    return boardData.map((row) =>
      row.map((cell) => {
        if (!cell) return null;
        return `${cell.color}${cell.type.toUpperCase()}`;
      })
    );
  };


  useEffect(() => {
    const handleUpdateBoard = ({ board: fen, currentTurn, move, capturedPiece, gameOver, message }) => {
      console.log('[CLIENT] Update received:', { fen, move, currentTurn, capturedPiece });
      const newChess = new Chess();
      newChess.load(fen);
      setChess(newChess);
      setBoard(transformBoardData(newChess.board()));
      setIsMyTurn(currentTurn === playerColor);

      if (move) {
        setLastMove(move);
      }

      if (capturedPiece) {
        if (currentTurn === playerColor) {
          setCapturedByPlayer((prev) => [...prev, capturedPiece]);
        } else {
          setCapturedByOpponent((prev) => [...prev, capturedPiece]);
        }
      }

      if (gameOver) {
        setResultModal({ message });
      }
    };

    // Подписываемся на событие updateBoard
    socket.on('updateBoard', handleUpdateBoard);

    return () => {
      socket.off('updateBoard', handleUpdateBoard); // Очищаем предыдущий слушатель
    };
  }, [gameId, playerColor]); // Добавляем зависимость от gameId



  const renderPiece = (piece) => {
    if (!piece) return null;
    return <img src={pieceImages[piece]} alt={piece} style={{ width: '100%', height: '100%' }} />;
  };

  // Функция для показа уведомления
  const showAlert = (message) => {
    setAlertMessage(message);
    setTimeout(() => {
      setAlertMessage(null); // Скрываем уведомление через 3 секунды
    }, 3000);
  };

  // Обработка кнопки "Сдаться"
  const handleSurrender = () => {
    toggleModal(); // Закрываем модальное окно
    socket.emit('surrender', { gameId });
  };

  useEffect(() => {
    // Слушаем событие окончания игры
    socket.on('gameEnded', ({ message }) => {
      setResultModal({ message }); // Используем данные с сервера
      

      setTimeLeft({ white: null, black: null }); // Сбрасываем таймер
    });

    return () => socket.off('gameEnded');
  }, [resetGame]);

  // Обработка кнопки "Предложить ничью"
  const handleOfferDraw = () => {
    toggleModal(); // Закрываем модальное окно
    showAlert('Ничья предложена'); // Показ уведомления

    socket.emit('offerDraw', { gameId }, (response) => {
      if (response.status !== 'success') {
        showAlert('Ошибка: Невозможно предложить ничью.');
      }
      });
    };

  const handleAcceptDraw = () => {
    setDrawOfferModal(null); // Закрываем модальное окно
    socket.emit('acceptDraw', { gameId });
  };

  const handleRejectDraw = () => {
    setDrawOfferModal(null); // Закрываем модальное окно
    socket.emit('rejectDraw', { gameId });
    showAlert('Вы отклонили ничью.');
  };


  useEffect(() => {
    // Слушаем предложение ничьей
    socket.on('drawOffered', ({ message }) => {
      setDrawOfferModal({ message }); // Открываем кастомное окно
    });

    // Слушаем событие отклонения ничьей
    socket.on('drawRejected', ({ message }) => {
      showAlert(message);
    });

    return () => {
        socket.off('drawOffered');
        socket.off('drawRejected');
      };
    }, [gameId]);

  const handleRematchRequest = () => {
    socket.emit('requestRematch', { gameId, playerColor });
    showAlert('Запрос на реванш отправлен');
  };

  useEffect(() => {
    socket.on('rematchRequested', ({ message }) => {
      setRematch(true);
      showAlert(message); // Уведомление о запросе реванша
    });

    return () => {
      socket.off('rematchRequested');
    };
  }, []);


  useEffect(() => {
    socket.on('rematchAccepted', ({ newGameId, color }) => {
      updateGameDetails(newGameId, color); // Обновляем gameId и цвет игрока
      setChess(new Chess()); // Сбрасываем шахматную доску
      setBoard(initialBoard); // Устанавливаем начальную доску
      setCapturedByPlayer([]);
      setCapturedByOpponent([]);
      setResultModal(null); // Закрываем модальное окно
      setRematch(null);
      showAlert('Реванш начался!');
    });

    return () => {
      socket.off('rematchAccepted');
    };
  }, [updateGameDetails]);


  const handleAcceptRematch = () => {
    socket.emit('acceptRematch', { gameId, playerColor });
    setResultModal(null);
    setRematch(null);
  };

  const handleRejectRematch = () => {
    socket.emit('rejectRematch', { gameId });
    showAlert('Вы отклонили реванш');
    setResultModal(null);
  };


  const handleExitToMenu = () => {
    resetGame(); 
    setResultModal(null);
    setRematch(null);
  };

  useEffect(() => {
    let interval;

    const startCountdown = (timeout) => {
      let countdown = timeout;
      setOpponentDisconnectTimer(countdown);

      interval = setInterval(() => {
        countdown -= 1;
        if (countdown <= 0) {
          clearInterval(interval);
          setOpponentDisconnectTimer(null); // Таймер завершился
        } else {
          setOpponentDisconnectTimer(countdown); // Уменьшаем значение
        }
      }, 1000);
    };

    socket.on('opponentDisconnected', ({ timeout }) => {
      clearInterval(interval); // Удаляем старый таймер, если он был
      startCountdown(timeout);
    });

    return () => {
      socket.off('opponentDisconnected');
      clearInterval(interval);
    };
  }, []);
const [userRank, setUserRank] = useState(); // Рейтинг игрока по умолчанию
const [opponentRank, setOpponentRank] = useState(); // Рейтинг оппонента по умолчанию

  useEffect(() => {
  const fetchRating = async (id, setRating) => {
    try {
      const response = await axios.get(`https://chess-battle.space/api/users/get_rating/${id}`);
      setRating(response.data.rating);
    } catch (error) {
      console.error('Ошибка при получении рейтинга:', error);
    }
  };

  if (userId) {
    fetchRating(userId, setUserRank);
  }

  socket.on('opponentInfo', ({ opponentId }) => {
    fetchRating(opponentId, setOpponentRank); // Запрашиваем рейтинг оппонента
  });

  return () => {
    socket.off('opponentInfo');
  };
}, [userId]);


  return (
      <div className="game-board-container">
       <PlayerInfo
          avatar={opponentAvatar}
          nickname="Opponent"
          rank={opponentRank}
          timeLeft={timeLeft?.[playerColor === 'white' ? 'black' : 'white'] || 0}
          capturedPieces={capturedByOpponent} // Оппонент захватил фигуры
          isOpponent={true}
          disconnectCountdown={opponentDisconnectTimer} // Передаем таймер отключения
          socket={socket}
          gameId={gameId}
        />
          <ChessBoard
            board={board}
            playerColor={playerColor}
            renderPiece={renderPiece}
            socket={socket}
            gameId={gameId}
            chess={chess} // Передаём экземпляр chess
            lastMove={lastMove} // Передаём состояние последнего хода
          />
          <PlayerInfo
            avatar={userAvatar}
            nickname="You"
            rank={userRank}
            timeLeft={timeLeft?.[playerColor] || 0}
            capturedPieces={capturedByPlayer} // Игрок захватил фигуры
            isOpponent={false}
            socket={socket}
            gameId={gameId}
          />

        {/* Кнопка с тремя точками */}
        <button className="three-dots-button" onClick={toggleModal}>
          &#x2022;&#x2022;&#x2022;
        </button>
        
        {resultModal && (
        <ResultModal
          message={resultModal.message}
          onRematch={handleRematchRequest}
          onAcceptRematch={handleAcceptRematch}
          onRejectRematch={handleRejectRematch}
          onExit={handleExitToMenu}
          isRematchRequested={isRematchRequested}
        />
        )}
        {showModal && (
          <Modal
            showModal={showModal}
            toggleModal={toggleModal}
            onSurrender={handleSurrender}
            onOfferDraw={handleOfferDraw}
          />
        )}
        {alertMessage && (
          <div className="alert-notification">
            {alertMessage}
          </div>
        )}
        {drawOfferModal && (
          <DrawOfferModal
            message={drawOfferModal.message}
            onAccept={handleAcceptDraw}
            onReject={handleRejectDraw}
          />
        )}
        {timeoutModal && (
          <div className="timeout-modal">
            <div className="modal-overlay" onClick={handleCloseTimeoutModal}></div>
            <div className="modal-content">
              <p>{timeoutModal}</p>
              <button onClick={handleCloseTimeoutModal}>Закрыть</button>
            </div>
          </div>
        )}
      </div>
    );
};
export default GameBoard;