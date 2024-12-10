import React, { useState } from 'react';
import './GameBoard.css'; // Стили для доски

const ChessBoard = ({
  board,
  playerColor,
  renderPiece,
  socket,
  gameId,
  chess,
  lastMove,
}) => {
  const [selected, setSelected] = useState(null); // Хранит выбранную клетку
  const [highlighted, setHighlighted] = useState([]); // Хранит подсвеченные клетки
  const [promotionModal, setPromotionModal] = useState(null); /// Добавлено для модального окна промоции

  if (!board) return <div>Loading...</div>;
const handleSquareClick = (row, col) => {
  const selectedSquare = `${String.fromCharCode(97 + col)}${8 - row}`; // Преобразование в шахматный формат, например, "e2"

  console.log('Clicked square:', selectedSquare);
  console.log('Current turn (chess.js):', chess.turn());
  console.log('Player color:', playerColor);

  const chessBoard = chess.board(); // Получаем состояние доски из chess.js
  const clickedPiece = chessBoard[row][col]; // Фигура на выбранной клетке

  if (!selected || (clickedPiece && clickedPiece.color === playerColor[0])) {
    // Логика выбора фигуры
    console.log('Selecting piece...');
    if (clickedPiece && clickedPiece.color === playerColor[0]) {
      // Проверяем, чья очередь ходить
      if (chess.turn() === playerColor[0]) {
        console.log('Piece selected at:', selectedSquare);

        const moves = chess.moves({ square: selectedSquare, verbose: true });
        console.log('Available moves for selected piece:', moves);

        setHighlighted(
          moves.map((move) => [
            8 - parseInt(move.to[1]), // Преобразование формата "e4" в индексы
            move.to.charCodeAt(0) - 97,
          ])
        );
        setSelected({ position: [row, col], square: selectedSquare }); // Обновляем выбранную фигуру
      } else {
        console.log('Not your turn. Moves will not be highlighted.');
      }
    } else {
      console.log('Cannot select this piece (empty square or opponent\'s piece).');
      setSelected(null); // Сбрасываем выбор
      setHighlighted([]);
    }
    return; // Завершаем обработку выбора
  }

  // Если фигура уже выбрана и пользователь пытается сделать ход
  console.log('Attempting move...');
  const move = { from: selected.square, to: selectedSquare };

  // Проверяем, является ли ход валидным
  const availableMoves = chess.moves({ square: selected.square, verbose: true });
  console.log('Available moves for the selected piece:', availableMoves);

  const isValidMove = availableMoves.some((validMove) => validMove.to === move.to);

  if (isValidMove) {
    // Проверяем, достигла ли пешка конца доски
    const isPawnPromotion =
      chess.get(selected.square)?.type === 'p' && // Это пешка
      ((playerColor === 'white' && row === 0) || // Белая пешка дошла до конца
        (playerColor === 'black' && row === 7)); // Черная пешка дошла до конца

    if (isPawnPromotion) {
      console.log('Pawn promotion detected!');
      setPromotionModal({ from: selected.square, to: selectedSquare }); // Открываем окно промоции
    } else {
      console.log('Move is valid. Sending to server...');
      socket.emit('move', { gameId, move });
      chess.move(move); // Локальное обновление доски
    }

    setSelected(null); // Сбрасываем выбор после хода
    setHighlighted([]);
  } else {
    console.log('Invalid move. Try again.');
  }
};


const handlePromotion = (piece) => {
  if (promotionModal) {
    console.log(`Promoting pawn to: ${piece}`);
    const move = { ...promotionModal, promotion: piece };
    socket.emit('move', { gameId, move });
    chess.move(move); // Локальное обновление доски
    setPromotionModal(null); // Закрываем модальное окно
  }
};


return (
  <div className="chess-board-container">
    {/// Модальное окно промоции
    promotionModal && (
      <div className="promotion-modal-overlay">
        <div className="promotion-modal">
          <p>Выберите фигуру:</p>
          <div className="promotion-options">
            {['q', 'r', 'b', 'n'].map((piece) => (
              <button key={piece} onClick={() => handlePromotion(piece)}>
                {renderPiece(`${playerColor[0]}${piece.toUpperCase()}`)}
              </button>
            ))}
          </div>
        </div>
      </div>
    )}

    <div className="chess-board">
      {(playerColor === 'black' ? [...board].reverse() : board).map((row, rowIndex) =>
        (playerColor === 'black' ? [...row].reverse() : row).map((piece, colIndex) => {
          const actualRow = playerColor === 'black' ? 7 - rowIndex : rowIndex;
          const actualCol = playerColor === 'black' ? 7 - colIndex : colIndex;

          const isHighlighted = highlighted.some(
            ([r, c]) => r === actualRow && c === actualCol
          );
          const isSelected =
            selected &&
            selected.position[0] === actualRow &&
            selected.position[1] === actualCol;

          // Определяем, является ли клетка частью последнего хода
          const isLastMoveFrom = 
            lastMove && lastMove.from === `${String.fromCharCode(97 + actualCol)}${8 - actualRow}`;
          const isLastMoveTo = 
            lastMove && lastMove.to === `${String.fromCharCode(97 + actualCol)}${8 - actualRow}`;

          return (
            <div
              key={`${actualRow}-${actualCol}`}
              onClick={() => handleSquareClick(actualRow, actualCol)} // Вызов обработки клика
              className={`square ${
                (actualRow + actualCol) % 2 === 0 ? 'light-square' : 'dark-square'
              } ${isHighlighted ? 'highlighted-circle' : ''} ${
                isSelected ? 'selected' : ''
              } ${isLastMoveFrom ? 'last-move-from' : ''} ${isLastMoveTo ? 'last-move-to' : ''}`} // Добавляем классы
            >
              {renderPiece(piece)}
            </div>
          );
        })
      )}
    </div>
  </div>
);
};

export default ChessBoard;
