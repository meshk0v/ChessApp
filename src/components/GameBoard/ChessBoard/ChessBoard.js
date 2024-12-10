import React, { useState } from 'react';
import './../GameBoard.css'; // Стили для доски
import PromotionModal from '../Modal/PromotionModal/PromotionModal';
import Square from './Square';
import { calculateHighlightedMoves, isPawnPromotion } from './chessUtils'; // Утилиты

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
  const [promotionModal, setPromotionModal] = useState(null); // Хранит данные о промоции

  // Обработка клика на клетке
  const handleSquareClick = (row, col) => {
    const selectedSquare = `${String.fromCharCode(97 + col)}${8 - row}`;
    const clickedPiece = chess.board()[row][col];
    const isOwnPiece = clickedPiece?.color === playerColor[0];

    // Если нет выбранной фигуры или нажата своя фигура
    if (!selected || isOwnPiece) {
      handlePieceSelection(row, col, selectedSquare, isOwnPiece);
    } else {
      handleMove(row, col, selectedSquare);
    }
  };

  // Выбор фигуры для хода
  const handlePieceSelection = (row, col, square, isOwnPiece) => {
    if (isOwnPiece) {
      const moves = chess.moves({ square, verbose: true });
      setHighlighted(calculateHighlightedMoves(moves));
      setSelected({ position: [row, col], square });
    } else {
      setSelected(null);
      setHighlighted([]);
    }
  };

  // Выполнение хода
  const handleMove = (row, col, square) => {
    const move = { from: selected.square, to: square };

    const isValidMove = chess
      .moves({ square: selected.square, verbose: true })
      .some((validMove) => validMove.to === move.to);

    if (isValidMove) {
      if (isPawnPromotion(chess, move, playerColor)) {
        setPromotionModal(move); // Открыть модальное окно
      } else {
        executeMove(move);
      }
      resetSelection();
    }
  };

  // Выполняем ход и отправляем на сервер
  const executeMove = (move) => {
    socket.emit('move', { gameId, move });
    chess.move(move); // Локальное обновление доски
  };

  // Обрабатываем промоцию пешки
  const handlePromotion = (piece) => {
    if (promotionModal) {
      const move = { ...promotionModal, promotion: piece };
      executeMove(move);
      setPromotionModal(null);
    }
  };

  // Сброс выделений
  const resetSelection = () => {
    setSelected(null);
    setHighlighted([]);
  };

  return (
    <div className="chess-board-container">
      {/* Модальное окно для промоции */}
      {promotionModal && (
        <PromotionModal playerColor={playerColor} onPromotion={handlePromotion} renderPiece={renderPiece} />
      )}

      {/* Доска */}
      <div className="chess-board">
        {(playerColor === 'black' ? [...board].reverse() : board).map(
          (row, rowIndex) =>
            (playerColor === 'black' ? [...row].reverse() : row).map(
              (piece, colIndex) => {
                const actualRow = playerColor === 'black' ? 7 - rowIndex : rowIndex;
                const actualCol = playerColor === 'black' ? 7 - colIndex : colIndex;

                const isHighlighted = highlighted.some(
                  ([r, c]) => r === actualRow && c === actualCol
                );

                const isSelected =
                  selected &&
                  selected.position[0] === actualRow &&
                  selected.position[1] === actualCol;

                const isLastMoveFrom =
                  lastMove &&
                  lastMove.from ===
                    `${String.fromCharCode(97 + actualCol)}${8 - actualRow}`;
                const isLastMoveTo =
                  lastMove &&
                  lastMove.to ===
                    `${String.fromCharCode(97 + actualCol)}${8 - actualRow}`;

                return (
                  <Square
                    key={`${actualRow}-${actualCol}`}
                    row={actualRow}
                    col={actualCol}
                    piece={piece}
                    isHighlighted={isHighlighted}
                    isSelected={isSelected}
                    isLastMoveFrom={isLastMoveFrom}
                    isLastMoveTo={isLastMoveTo}
                    onClick={() => handleSquareClick(actualRow, actualCol)}
                    renderPiece={renderPiece}
                  />
                );
              }
            )
        )}
      </div>
    </div>
  );
};

export default ChessBoard;
