import React from 'react';
import './GameBoard.css'; // Создайте файл стилей, если нужно

const ChessBoard = ({
  board,
  playerColor,
  highlightedSquares,
  selectedPiece,
  onSquareClick,
  renderPiece,
}) => {
  if (!board) return <div>Loading...</div>;

  const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  return (
    <div className="chess-board">
      {(playerColor === 'black' ? [...board].reverse() : board).map((row, rowIndex) =>
        (playerColor === 'black' ? [...row].reverse() : row).map((piece, colIndex) => {
          const actualRow = playerColor === 'black' ? 7 - rowIndex : rowIndex;
          const actualCol = playerColor === 'black' ? 7 - colIndex : colIndex;

          const isHighlighted = highlightedSquares.some(
            ([r, c]) => r === actualRow && c === actualCol
          );
          const isSelected =
            selectedPiece &&
            selectedPiece.position[0] === actualRow &&
            selectedPiece.position[1] === actualCol;

          return (
            <div
              key={`${actualRow}-${actualCol}`}
              className={`square ${
                (actualRow + actualCol) % 2 === 0 ? 'light-square' : 'dark-square'
              } ${isHighlighted ? 'highlighted-circle' : ''} ${
                isSelected ? 'selected' : ''
              }`}
              onClick={
                !isMobileDevice
                  ? () => onSquareClick(actualRow, actualCol)
                  : undefined
              }
              onTouchStart={
                isMobileDevice
                  ? (e) => {
                      e.preventDefault();
                      onSquareClick(actualRow, actualCol);
                    }
                  : undefined
              }
            >
              {renderPiece(piece)}
            </div>
          );
        })
      )}
    </div>
  );
};

export default ChessBoard;
