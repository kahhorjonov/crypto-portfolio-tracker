import { FaCheck, FaTimes } from "react-icons/fa";
import "./styles/DeleteCoinModal.css";

const DeleteCoinModal = ({
  deleteCoinModal,
  setDeleteCoinModal,
  removeCoin,
}) => {
  if (!deleteCoinModal.isOpen) return null;

  return (
    <div className="modal" style={{ zIndex: 1100 }}>
      <div className="modal-content">
        <h2>Подтвердить удаление монеты {deleteCoinModal.coin}?</h2>

        <div className="modal-buttons">
          <button onClick={() => removeCoin(deleteCoinModal.coin)}>
            <FaCheck /> Да
          </button>
          <button
            onClick={() => setDeleteCoinModal({ isOpen: false, coin: "" })}
          >
            <FaTimes /> Нет
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteCoinModal;
