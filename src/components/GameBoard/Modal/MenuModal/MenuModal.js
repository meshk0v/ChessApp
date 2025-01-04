const Modal = ({ showModal, toggleModal, onSurrender, onOfferDraw }) => {
  if (!showModal) return null;

  return (
    <>
      <div className="modal-overlay" onClick={toggleModal}></div>
      <div className="modal-content">
        <button onClick={onSurrender}>
          Surrender
        </button>
        <button onClick={onOfferDraw} >
          Offer Draw
        </button>
        <button className="continue-button" onClick={toggleModal}>
          Continue
        </button>
      </div>
    </>
  );
};

export default Modal;
