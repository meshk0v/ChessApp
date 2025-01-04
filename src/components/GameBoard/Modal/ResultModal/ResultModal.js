import React from 'react';
import styles from './ResultModal.module.css';

const ResultModal = ({ 
  message, 
  onRematch, 
  onAcceptRematch, 
  onRejectRematch, 
  onExit, 
  isRematchRequested 
}) => {
  return (
    <div className={styles["custom-modal-overlay"]}>
      <div className={styles["custom-modal"]}>
        <h3>{message}</h3>
        <div className={styles["custom-modal-actions"]}>
          {isRematchRequested ? (
            <>
              <button onClick={onAcceptRematch} className={styles.accept}>
                Accept Rematch
              </button>
              <button onClick={onRejectRematch} className={styles.reject}>
                Decline
              </button>
            </>
          ) : (
            <>
              <button onClick={onRematch} className={styles.rematch}>
                Rematch
              </button>
              <button onClick={onExit} className={styles.exit}>
                Main Menu
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultModal;
