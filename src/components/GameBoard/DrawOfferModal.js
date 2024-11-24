import React from 'react';
import './GameBoard.css'; // Создайте файл стилей, если необходимо

const DrawOfferModal = ({ message, onAccept, onReject }) => {
  if (!message) return null;

  return (
    <div className="custom-modal-overlay">
      <div className="custom-modal">
        <p>{message}</p>
        <div className="custom-modal-actions">
          <button onClick={onAccept}>Принять</button>
          <button onClick={onReject}>Отклонить</button>
        </div>
      </div>
    </div>
  );
};

export default DrawOfferModal;
