// Утилита для подсчёта подсвеченных клеток
export const calculateHighlightedMoves = (moves) =>
  moves.map((move) => [
    8 - parseInt(move.to[1]), // Преобразование формата "e4" в индексы
    move.to.charCodeAt(0) - 97,
  ]);

// Утилита для проверки промоции пешки
export const isPawnPromotion = (chess, move, playerColor) => {
  const piece = chess.get(move.from);
  return (
    piece?.type === 'p' &&
    ((playerColor === 'white' && move.to[1] === '8') ||
      (playerColor === 'black' && move.to[1] === '1'))
  );
};
