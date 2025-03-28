import { FaCheck, FaTimes } from "react-icons/fa";
import "./styles/DeleteModal.css";

const DeleteModal = ({ deleteModal, setDeleteModal, deleteTransaction }) => {
  if (!deleteModal.isOpen) return null;

  return (
    <div className="modal" style={{ zIndex: 1100 }}>
      <div className="modal-content">
        <h2>Подтвердить удаление транзакции?</h2>

        <div className="modal-buttons">
          <button
            onClick={() => deleteTransaction(deleteModal.coin, deleteModal.id)}
          >
            <FaCheck /> Да
          </button>

          <button
            onClick={() =>
              setDeleteModal({ isOpen: false, coin: "", id: null })
            }
          >
            <FaTimes /> Нет
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
