const Modal = ({ showModal, toggleModal, onSurrender, onOfferDraw, surrenderDisabled, drawOfferDisabled }) => {
  if (!showModal) return null;

  return (
    <>
      <div className="modal-overlay" onClick={toggleModal}></div>
      <div className="modal-content">
        <button onClick={onSurrender} disabled={surrenderDisabled}>
          {surrenderDisabled ? 'Сдача...' : 'Сдаться'}
        </button>
        <button onClick={onOfferDraw} disabled={drawOfferDisabled}>
          {drawOfferDisabled ? 'Предложение отправлено...' : 'Предложить ничью'}
        </button>
        <button className="continue-button" onClick={toggleModal}>
          Продолжить
        </button>
      </div>
    </>
  );
};

export default Modal;
