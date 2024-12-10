import React from 'react';
import styles from './ResultModal.module.css'

const ResultModal = ({ message, onRematch, onExit }) => {
  return (
    <div className={styles["custom-modal-overlay"]}>
      <div className={styles["custom-modal"]}>
        <h3>{message}</h3>
        <div className={styles["custom-modal-actions"]}>
          <button onClick={onRematch}>Реванш</button>
          <button onClick={onExit}>В главное меню</button>
        </div>
      </div>
    </div>
  );
};

export default ResultModal;
