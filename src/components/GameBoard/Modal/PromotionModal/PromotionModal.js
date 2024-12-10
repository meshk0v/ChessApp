import React from 'react';
import './PromotionModal.css'; // Подключите стили для модального окна

const PromotionModal = ({ playerColor, onPromotion, renderPiece }) => {
  return (
      <div className="promotion-modal-overlay">
        <div className="promotion-modal">
          <p>Выберите фигуру:</p>
          <div className="promotion-options">
            {['q', 'r', 'b', 'n'].map((piece) => (
              <button key={piece} onClick={() => onPromotion(piece)}>
                {renderPiece(`${playerColor[0]}${piece.toUpperCase()}`)}
              </button>
            ))}
          </div>
        </div>
      </div>
  );
};

export default PromotionModal;
