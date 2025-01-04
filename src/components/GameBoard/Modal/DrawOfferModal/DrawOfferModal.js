import React from 'react';
import './DrawOfferModal.css'; // Создайте файл стилей, если необходимо

const DrawOfferModal = ({ message, onAccept, onReject }) => {
  if (!message) return null;

  return (
    <div className="custom-modal-overlay">
      <div className="custom-modal">
        <p>{message}</p>
        <div className="custom-modal-actions">
          <button onClick={onAccept}>Accept</button>
          <button onClick={onReject}>Decline</button>
        </div>
      </div>
    </div>
  );
};

export default DrawOfferModal;
