import React, { useEffect, useState } from 'react';
import './GameBoard.css';
import socket from '../../socket';

import axios from 'axios';
import { getPossibleMoves } from './chessUtils';
import pieceImages from './pieceImages';
import initialBoard from './initialBoard';
import Modal from './Modal';

const GameBoard = ({ gameId, playerColor, resetGame }) => {
  const [board, setBoard] = useState(initialBoard);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [highlightedSquares, setHighlightedSquares] = useState([]);
  const [isMyTurn, setIsMyTurn] = useState(playerColor === 'white'); // Белые ходят первыми
  const [userAvatar, setUserAvatar] = useState(null);
  const [opponentAvatar, setOpponentAvatar] = useState(null);
  const userId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
  const [showModal, setShowModal] = useState(false);
  const [timeoutModal, setTimeoutModal] = useState(null); // Уведомление о времени
  const [timeLeft, setTimeLeft] = useState({ white: null, black: null });
  const [surrenderDisabled, setSurrenderDisabled] = useState(false);
  const [drawOfferDisabled, setDrawOfferDisabled] = useState(false);

useEffect(() => {
  // Получение времени с сервера
  socket.on('syncTime', ({ timeLeft }) => {
    console.log('[CLIENT] Sync Time Received:', timeLeft);

    setTimeLeft((prevTimeLeft) => {
      if (!prevTimeLeft) return timeLeft;

      // Проверка на отклонение времени
      const whiteDiff = Math.abs(timeLeft.white - prevTimeLeft.white);
      const blackDiff = Math.abs(timeLeft.black - prevTimeLeft.black);

      // Если отклонение больше 1 секунды, синхронизируем
      if (whiteDiff > 1 || blackDiff > 1) {
        console.log('[CLIENT] Time difference detected, syncing...');
        return timeLeft;
      }

      // Если разницы нет, оставляем локальный таймер
      return prevTimeLeft;
    });
  });

  return () => socket.off('syncTime');
}, []);

useEffect(() => {
  // Локальный таймер
  const smoothTimer = setInterval(() => {
    setTimeLeft((prevTimeLeft) => {
      if (!prevTimeLeft) return null;

      const updatedTime = { ...prevTimeLeft };
      const currentColor = isMyTurn ? playerColor : (playerColor === 'white' ? 'black' : 'white');

      // Уменьшаем время для текущего игрока
      if (updatedTime[currentColor] > 0) {
        updatedTime[currentColor] -= 1;
      }

      return updatedTime;
    });
  }, 1000);

  return () => clearInterval(smoothTimer);
}, [isMyTurn, playerColor]);

useEffect(() => {
  socket.on('updateBoard', ({ gameId: receivedGameId, board, currentTurn, timeLeft }) => {
    console.log('[CLIENT] Board Updated:', { board, currentTurn, timeLeft });
    if (receivedGameId === gameId) {
      setBoard(board.map(row => row.map(cell => cell ? `${cell.color}${cell.type.toUpperCase()}` : null)));
      setIsMyTurn(currentTurn === playerColor);
      setTimeLeft(timeLeft); // Сохраняем время, полученное от сервера
    }
  });

  return () => socket.off('updateBoard');
}, [gameId, playerColor]);



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


const onClickSquare = (row, col) => {
  if (!isMyTurn) {
    console.log("Сейчас ход противника. Пожалуйста, дождитесь своего хода.");
    return;
  }

  const piece = board[row][col];
  console.log(`Clicked square (${row}, ${col}) with piece: ${piece}`);
  console.log(`Selected piece: ${selectedPiece ? selectedPiece.piece : 'none'}`);

  // Если щелкнули на свою другую фигуру, то выбираем ее
  if (piece && piece[0] === playerColor[0]) {
    if (selectedPiece && (selectedPiece.position[0] !== row || selectedPiece.position[1] !== col)) {
      console.log(`Switching selected piece to: ${piece} at position (${row}, ${col})`);
      setSelectedPiece({ piece, position: [row, col] });
      setHighlightedSquares(getPossibleMoves(board, piece, row, col));
      if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
      }
      return;
    }
  }

  // Если фигура уже выбрана, проверяем допустимость хода на клетку
  if (selectedPiece) {
    const isValidMove = highlightedSquares.some(([r, c]) => r === row && c === col);
    console.log(`Valid move check: ${isValidMove} for square (${row}, ${col})`);

    if (isValidMove) {
      const newBoard = board.map(row => row.slice());
      const targetPiece = newBoard[row][col];
      
      console.log(`Target piece at (${row}, ${col}): ${targetPiece}`);
      
      // Проверяем, является ли целевая фигура противником для захвата
      if (targetPiece && targetPiece[0] !== playerColor[0]) {
        console.log(`Capturing piece at (${row}, ${col})`);
      }
      
      newBoard[row][col] = selectedPiece.piece;
      newBoard[selectedPiece.position[0]][selectedPiece.position[1]] = null;

      setBoard(newBoard);
      setSelectedPiece(null);
      setHighlightedSquares([]);

      // Отправка хода на сервер через сокет
      socket.emit('makeMove', {
        gameId,
        fromRow: selectedPiece.position[0],
        fromCol: selectedPiece.position[1],
        toRow: row,
        toCol: col
      });

      setIsMyTurn(false);

      if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
      }
      return;
    } else {
      console.log("Неправильный ход!");
      return;
    }
  }

  // Если фигура еще не выбрана, проверяем, что щелкнули на свою фигуру
  if (piece && piece[0] === playerColor[0]) {
    console.log(`Selecting piece: ${piece} at position (${row}, ${col})`);
    setSelectedPiece({ piece, position: [row, col] });
    setHighlightedSquares(getPossibleMoves(board, piece, row, col));
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
  } else {
    console.log("Это не ваша фигура!");
  }
};

 const transformBoardData = (boardData) => {
    return boardData.map(row =>
      row.map(cell => {
        if (!cell) return null; // пустая клетка
        return `${cell.color}${cell.type.toUpperCase()}`; // преобразуем в формат "wP", "bR" и т.д.
      })
    );
  };

  
useEffect(() => {
  socket.on('updateBoard', ({ gameId: receivedGameId, board, currentTurn }) => {
    if (receivedGameId === gameId) {
      console.log('Получена обновленная доска:', board);
      console.log('Текущий ход:', currentTurn);

      const transformedBoard = transformBoardData(board);
      setBoard(transformedBoard);

      // Обновляем флаг isMyTurn, чтобы определить, можно ли делать ход
      setIsMyTurn(currentTurn === playerColor);
    }
  });

  return () => {
    socket.off('updateBoard');
  };
}, [socket, gameId, playerColor]);


const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

const handleSquareClick = (row, col) => {
  onClickSquare(row, col);
};

const renderPiece = (piece) => {
  if (!piece) return null;
  return <img src={pieceImages[piece]} alt={piece} style={{ width: '100%', height: '100%' }} />;
};
const [alertMessage, setAlertMessage] = useState(null);


// Функция для показа уведомления
const showAlert = (message) => {
  setAlertMessage(message);
  setTimeout(() => {
    setAlertMessage(null); // Скрываем уведомление через 3 секунды
  }, 3000);
};

// Обработка кнопки "Сдаться"
const handleSurrender = () => {
  setSurrenderDisabled(true);
  toggleModal(); // Закрываем модальное окно
  const winner = playerColor === 'white' ? 'Opponent (Black)' : 'Opponent (White)';
  
  showAlert(`Вы сдались! Победитель: ${winner}`);
  
  socket.emit('surrender', { gameId });
};

useEffect(() => {
  // Слушаем событие окончания игры
  socket.on('gameEnded', ({ message }) => {
    showAlert(message); // Показываем сообщение о результате игры
    setTimeout(() => {
      resetGame(); // Сбрасываем игру через 3 секунды
    }, 3000);
  });

  return () => socket.off('gameEnded');
}, [resetGame]);


  // Обработка кнопки "Предложить ничью"
  const handleOfferDraw = () => {
    toggleModal(); // Закрываем модальное окно
    setDrawOfferDisabled(true);
    showAlert('Ничья предложена'); // Показ уведомления

    socket.emit('offerDraw', { gameId }, (response) => {
      if (response.status !== 'success') {
        showAlert('Ошибка: Невозможно предложить ничью.');
        setDrawOfferDisabled(false);
      }
    });
  };

const [drawOfferModal, setDrawOfferModal] = useState(null); // Хранит сообщение о предложении ничьей

const handleAcceptDraw = () => {
  setDrawOfferModal(null); // Закрываем модальное окно
  socket.emit('acceptDraw', { gameId });
  showAlert('Ничья принята! Игра завершена.');
  setTimeout(() => resetGame(), 3000);
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
    setDrawOfferDisabled(false); // Снова разрешаем предлагать ничью
  });

  return () => {
    socket.off('drawOffered');
    socket.off('drawRejected');
  };
}, [gameId]);









  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };


return (
    <div className="game-board-container">
        <div className="top-info-container">
            <div className="avatar-container1">
                {opponentAvatar ? (
                    <img src={opponentAvatar} alt="Opponent Avatar" />
                ) : (
                    <img src="default-avatar.png" alt="Default Opponent Avatar" />
                )}
            </div>
            <div className="user-info-wrapper">
                <div className="user-info">
                    <div className="user-nickname">Opponent</div>
                    <div className="user-rank">Rank: 432</div>
                </div>
                <div className="timer-container">{formatTime(timeLeft?.[playerColor === 'white' ? 'black' : 'white'] || 0)}</div>
            </div>
        </div>

        <div className="chess-board">
            {(playerColor === 'black' ? [...board].reverse() : board).map((row, rowIndex) =>
                (playerColor === 'black' ? [...row].reverse() : row).map((piece, colIndex) => {
                    const actualRow = playerColor === 'black' ? 7 - rowIndex : rowIndex;
                    const actualCol = playerColor === 'black' ? 7 - colIndex : colIndex;

                    const isHighlighted = highlightedSquares.some(([r, c]) => r === actualRow && c === actualCol);
                    const isSelected = selectedPiece && selectedPiece.position[0] === actualRow && selectedPiece.position[1] === actualCol;

                    return (
                        <div
                            key={`${actualRow}-${actualCol}`}
                            className={`square ${(actualRow + actualCol) % 2 === 0 ? 'light-square' : 'dark-square'} ${isHighlighted ? 'highlighted-circle' : ''} ${isSelected ? 'selected' : ''}`}
                            onClick={!isMobileDevice ? () => handleSquareClick(actualRow, actualCol) : undefined}
                            onTouchStart={isMobileDevice ? (e) => {
                                e.preventDefault();
                                handleSquareClick(actualRow, actualCol);
                            } : undefined}
                        >
                            {renderPiece(piece)}
                        </div>
                    );
                })
            )}
        </div>

        <div className="bottom-info-container">
            <div className="avatar-container1">
                {userAvatar ? (
                    <img src={userAvatar} alt="User Avatar" />
                ) : (
                    <img src="default-avatar.png" alt="Default User Avatar" />
                )}
            </div>
            <div className="user-info-wrapper">
                <div className="user-info">
                    <div className="user-nickname">You</div>
                    <div className="user-rank">Rank: 432</div>
                </div>
                <div className="timer-container">{formatTime(timeLeft?.[playerColor] || 0)}</div>
            </div>
        </div>
      {/* Кнопка с тремя точками */}
      <button className="three-dots-button" onClick={toggleModal}>
        &#x2022;&#x2022;&#x2022;
      </button>

      {showModal && (
        <Modal
          showModal={showModal}
          toggleModal={toggleModal}
          onSurrender={handleSurrender}
          onOfferDraw={handleOfferDraw}
          surrenderDisabled={surrenderDisabled}
          drawOfferDisabled={drawOfferDisabled}
        />
      )}
      {alertMessage && (
        <div className="alert-notification">
          {alertMessage}
        </div>
      )}
{drawOfferModal && (
  <div className="custom-modal-overlay">
    <div className="custom-modal">
      <p>{drawOfferModal.message}</p>
      <div className="custom-modal-actions">
        <button onClick={handleAcceptDraw}>Принять</button>
        <button onClick={handleRejectDraw}>Отклонить</button>
      </div>
    </div>
  </div>
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