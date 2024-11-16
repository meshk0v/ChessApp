export const getPossibleMoves = (board, piece, row, col) => {
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
    if ((isWhitePiece && row === 6) || (!isWhitePiece && row === 1)) {
      if (!board[row + direction][col] && !board[row + direction * 2][col]) {
        moves.push([row + direction * 2, col]);
      }
    }

    // Съедание по диагонали
    const diagonalOffsets = [
      [-1, -1], [-1, 1], [1, -1], [1, 1]
    ];
    diagonalOffsets.forEach(([rOffset, cOffset]) => {
      const targetRow = row + rOffset;
      const targetCol = col + cOffset;
      if (targetRow >= 0 && targetRow < 8 && targetCol >= 0 && targetCol < 8) {
        const targetPiece = board[targetRow][targetCol];
        if (targetPiece && targetPiece[0] !== piece[0]) {
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
        if (!targetPiece || targetPiece[0] !== piece[0]) {
          moves.push([newRow, newCol]);
        }
      }
    });
  }

  // Слон
  if (piece === 'wB' || piece === 'bB') {
    const directions = [
      [-1, -1], [-1, 1], [1, -1], [1, 1]
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
            if (targetPiece[0] !== piece[0]) moves.push([newRow, newCol]);
            break;
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
      [-1, 0], [1, 0], [0, -1], [0, 1]
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
            if (targetPiece[0] !== piece[0]) moves.push([newRow, newCol]);
            break;
          }
        } else {
          break;
        }
      }
    });
  }

  // Ферзь
  if (piece === 'wQ' || piece === 'bQ') {
    const rookMoves = getPossibleMoves(board, isWhitePiece ? 'wR' : 'bR', row, col);
    const bishopMoves = getPossibleMoves(board, isWhitePiece ? 'wB' : 'bB', row, col);
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
        if (!targetPiece || targetPiece[0] !== piece[0]) {
          moves.push([newRow, newCol]);
        }
      }
    });
  }

  return moves;
};
