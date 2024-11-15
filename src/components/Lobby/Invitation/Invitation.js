import React from 'react';
import './Invitation.css';

const Invitation = ({ gameId, invitationLink, waitingMessage, onCopy, onShare, playerJoined }) => {
  const isMobile = /android|iphone|ipad|ipod/i.test(
    (navigator.userAgent || navigator.vendor || window.opera).toLowerCase()
  );

    console.log('text -'+playerJoined)
  return (
    <div className="invitation">
      <h2>Ожидание соперника...</h2>
      {!playerJoined && ( // Проверка, чтобы не показывать кнопки, если игрок присоединился
        <div className="invitation-buttons">
          {isMobile ? (
            <button onClick={onShare} className="styled-button">
              Поделиться
            </button>
          ) : (
            <>
              <input 
                type="text" 
                readOnly 
                value={invitationLink} 
                className="invitation-link-input"
              />
              <button onClick={onCopy} className="styled-button">
                Скопировать ссылку
              </button>
            </>
          )}
        </div>
      )}
      {waitingMessage && <p>{waitingMessage}</p>}
    </div>
  );
};

export default Invitation;
