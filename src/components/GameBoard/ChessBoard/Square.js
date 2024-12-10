import React from 'react';

const Square = ({
  row,
  col,
  piece,
  isHighlighted,
  isSelected,
  isLastMoveFrom,
  isLastMoveTo,
  onClick,
  renderPiece,
}) => {
  return (
    <div
      className={`square ${
        (row + col) % 2 === 0 ? 'light-square' : 'dark-square'
      } ${isHighlighted ? 'highlighted-circle' : ''} ${
        isSelected ? 'selected' : ''
      } ${isLastMoveFrom ? 'last-move-from' : ''} ${
        isLastMoveTo ? 'last-move-to' : ''
      }`}
      onClick={onClick}
    >
      {renderPiece(piece)}
    </div>
  );
};

export default Square;
