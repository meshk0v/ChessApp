const Modal = ({ showModal, toggleModal, onSurrender, onOfferDraw }) => {
  if (!showModal) return null;

  return (
    <>
      <div className="modal-overlay" onClick={toggleModal}></div>
      <div className="modal-content">
        <button onClick={onSurrender}>Сдаться</button>
        <button onClick={onOfferDraw}>Предложить ничью</button>
        <button className="continue-button" onClick={toggleModal}>
          Продолжить
        </button>
      </div>
    </>
  );
};

export default Modal;
