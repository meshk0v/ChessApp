import React, { useEffect, useState } from 'react';
import './GameBoard.css';
import socket from '../../socket';
import wP from '../../assets/chess-pieces/wP.svg';
import wR from '../../assets/chess-pieces/wR.svg';
import wN from '../../assets/chess-pieces/wN.svg';
import wB from '../../assets/chess-pieces/wB.svg';
import wQ from '../../assets/chess-pieces/wQ.svg';
import wK from '../../assets/chess-pieces/wK.svg';
import bP from '../../assets/chess-pieces/bP.svg';
import bR from '../../assets/chess-pieces/bR.svg';
import bN from '../../assets/chess-pieces/bN.svg';
import bB from '../../assets/chess-pieces/bB.svg';
import bQ from '../../assets/chess-pieces/bQ.svg';
import bK from '../../assets/chess-pieces/bK.svg';
import axios from 'axios';

const pieceImages = {
  wP, wR, wN, wB, wQ, wK,
  bP, bR, bN, bB, bQ, bK
};

const initialBoard = [
  ['bR', 'bN', 'bB', 'bQ', 'bK', 'bB', 'bN', 'bR'],
  ['bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP'],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ['wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP'],
  ['wR', 'wN', 'wB', 'wQ', 'wK', 'wB', 'wN', 'wR']
];

const GameBoard = ({ gameId, playerColor, resetGame }) => {
  const [board, setBoard] = useState(initialBoard);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [highlightedSquares, setHighlightedSquares] = useState([]);
  const [isMyTurn, setIsMyTurn] = useState(playerColor === 'white'); // Белые ходят первыми
  const [userAvatar, setUserAvatar] = useState(null);
  const [opponentAvatar, setOpponentAvatar] = useState(null);
  const [myTimeLeft, setMyTimeLeft] = useState(60);
  const [opponentTimeLeft, setOpponentTimeLeft] = useState(60);
  const userId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
  const [showModal, setShowModal] = useState(false);
  const [timeoutModal, setTimeoutModal] = useState(null); // Уведомление о времени

  const handleCloseTimeoutModal = () => {
    setTimeoutModal(null);
    resetGame();
  };
  
  const toggleModal = () => {
    setShowModal(!showModal);
  };
  // Таймер обновляется только у активного игрока
  useEffect(() => {
    const interval = setInterval(() => {
      if (isMyTurn) {
        setMyTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
      } else {
        setOpponentTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isMyTurn]);

  // Проверка на истечение времени
  useEffect(() => {
    if (myTimeLeft === 0 && !timeoutModal) {
      setTimeoutModal('Вы проиграли по времени.');
    } else if (opponentTimeLeft === 0 && !timeoutModal) {
      setTimeoutModal('Ваш соперник проиграл по времени.');
    }
  }, [myTimeLeft, opponentTimeLeft, timeoutModal]);

  useEffect(() => {
    socket.on('updateBoard', ({ gameId: receivedGameId, board, currentTurn, timeLeft }) => {
      if (receivedGameId === gameId) {
        setBoard(board.map(row => row.map(cell => cell ? `${cell.color}${cell.type.toUpperCase()}` : null)));
        setIsMyTurn(currentTurn === playerColor);

        if (playerColor === 'white') {
          setMyTimeLeft(timeLeft.white);
          setOpponentTimeLeft(timeLeft.black);
        } else {
          setMyTimeLeft(timeLeft.black);
          setOpponentTimeLeft(timeLeft.white);
        }
      }
    });

    return () => socket.off('updateBoard');
  }, [gameId, playerColor]);


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
      setHighlightedSquares(getPossibleMoves(piece, row, col));
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
    setHighlightedSquares(getPossibleMoves(piece, row, col));
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
  } else {
    console.log("Это не ваша фигура!");
  }
};



const getPossibleMoves = (piece, row, col) => {
  const moves = [];
  const isWhitePiece = piece[0] === 'w';

  // Пешка
  if (piece === 'wP' || piece === 'bP') {
    const direction = isWhitePiece ? -1 : 1;

    // Один шаг вперед, если клетка свободна
    if (row + direction >= 0 && row + direction < 8 && !board[row + direction][col]) {
      moves.push([row + direction, col]);
    }

    // Два шага вперед с начальной позиции, если обе клетки свободны
    if (
      (isWhitePiece && row === 6) || (!isWhitePiece && row === 1)
    ) {
      if (
        !board[row + direction][col] &&
        !board[row + direction * 2][col]
      ) {
        moves.push([row + direction * 2, col]);
      }
    }

    // Съедание по диагонали
    const diagonalOffsets = [
      [-1, -1], [-1, 1], [1, -1], [1, 1] // Диагонали для пешки
    ];
    diagonalOffsets.forEach(([rOffset, cOffset]) => {
      const targetRow = row + rOffset;
      const targetCol = col + cOffset;
      if (targetRow >= 0 && targetRow < 8 && targetCol >= 0 && targetCol < 8) {
        const targetPiece = board[targetRow][targetCol];
        if (targetPiece && targetPiece[0] !== piece[0]) {  // Противник
          moves.push([targetRow, targetCol]);
        }
      }
    });
  }

  // Конь
  if (piece === 'wN' || piece === 'bN') {
    const knightMoves = [
      [-2, -1], [-2, 1], [2, -1], [2, 1], 
      [-1, -2], [-1, 2], [1, -2], [1, 2]
    ];
    knightMoves.forEach(([rOffset, cOffset]) => {
      const newRow = row + rOffset;
      const newCol = col + cOffset;
      if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
        const targetPiece = board[newRow][newCol];
        if (!targetPiece || targetPiece[0] !== piece[0]) {  // Противник или пусто
          moves.push([newRow, newCol]);
        }
      }
    });
  }

  // Слон
  if (piece === 'wB' || piece === 'bB') {
    const directions = [
      [-1, -1], [-1, 1], [1, -1], [1, 1] // Все четыре диагонали
    ];
    directions.forEach(([rOffset, cOffset]) => {
      let newRow = row;
      let newCol = col;
      while (true) {
        newRow += rOffset;
        newCol += cOffset;
        if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
          const targetPiece = board[newRow][newCol];
          if (!targetPiece) {
            moves.push([newRow, newCol]);
          } else {
            if (targetPiece[0] !== piece[0]) moves.push([newRow, newCol]); // Противник
            break;  // Остановимся, если на клетке стоит фигура
          }
        } else {
          break;
        }
      }
    });
  }

  // Ладья
  if (piece === 'wR' || piece === 'bR') {
    const directions = [
      [-1, 0], [1, 0], [0, -1], [0, 1] // Все четыре направления
    ];
    directions.forEach(([rOffset, cOffset]) => {
      let newRow = row;
      let newCol = col;
      while (true) {
        newRow += rOffset;
        newCol += cOffset;
        if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
          const targetPiece = board[newRow][newCol];
          if (!targetPiece) {
            moves.push([newRow, newCol]);
          } else {
            if (targetPiece[0] !== piece[0]) moves.push([newRow, newCol]); // Противник
            break;
          }
        } else {
          break;
        }
      }
    });
  }

  // Ферзь (сочетание слона и ладьи)
  if (piece === 'wQ' || piece === 'bQ') {
    const rookMoves = getPossibleMoves(isWhitePiece ? 'wR' : 'bR', row, col);
    const bishopMoves = getPossibleMoves(isWhitePiece ? 'wB' : 'bB', row, col);
    return [...rookMoves, ...bishopMoves];
  }

  // Король
  if (piece === 'wK' || piece === 'bK') {
    const kingMoves = [
      [-1, 0], [1, 0], [0, -1], [0, 1], 
      [-1, -1], [-1, 1], [1, -1], [1, 1]
    ];
    kingMoves.forEach(([rOffset, cOffset]) => {
      const newRow = row + rOffset;
      const newCol = col + cOffset;
      if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
        const targetPiece = board[newRow][newCol];
        if (!targetPiece || targetPiece[0] !== piece[0]) {  // Противник или пусто
          moves.push([newRow, newCol]);
        }
      }
    });
  }

  return moves;
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


  const handleSurrender = () => {
    socket.emit('surrender', { gameId });
    alert("Вы сдались!");
  };

  const offerDraw = () => {
    socket.emit('offerDraw', { gameId });
    alert("Вы предложили ничью.");
  };
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

    const handleCloseModal = () => {
    setShowModal(false);
  };

return (
    <div className="game-board-container">
        <div className="top-info-container">
            <div className="avatar-container">
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
                <div className="timer-container">{formatTime(opponentTimeLeft)}</div>
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
            <div className="avatar-container">
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
                <div className="timer-container">{formatTime(myTimeLeft)}</div>
            </div>
        </div>
      {/* Кнопка с тремя точками */}
      <button className="three-dots-button" onClick={toggleModal}>
        &#x2022;&#x2022;&#x2022;
      </button>

      {/* Модальное окно с выбором действий */}
      {showModal && (
        <>
          <div className="modal-overlay" onClick={toggleModal}></div>
          <div className="modal-content">
            <button onClick={() => alert("Сдаться")}>Сдаться</button>
            <button onClick={() => alert("Предложить ничью")}>Предложить ничью</button>
            <button className="continue-button" onClick={() => setShowModal(false)}>
              Продолжить
            </button>
          </div>
        </>
      )}

      {/* Уведомление об истечении времени */}
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