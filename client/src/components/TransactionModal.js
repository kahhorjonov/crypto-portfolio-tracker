import { FaCheck, FaTimes } from "react-icons/fa";
import "./styles/TransactionModal.css";

const TransactionModal = ({ modal, setModal, handleTransaction }) => {
  if (!modal.isOpen) return null;

  return (
    <div className="modal" style={{ zIndex: 1000 }}>
      <div className="modal-content">
        <h2>
          {modal.type === "buy" ? "Купить" : "Продать"} - {modal.coin}
        </h2>
        <input
          type="number"
          placeholder="Количество"
          id="quantity"
          defaultValue={modal.transaction?.quantity || ""}
        />
        <input
          type="number"
          placeholder="Цена (USDT)"
          id="price"
          defaultValue={modal.transaction?.price || ""}
        />
        <div className="actions-button">
          <button
            className="action-button"
            onClick={() => {
              const quantity = document.getElementById("quantity").value;
              const price = document.getElementById("price").value;
              handleTransaction(
                modal.coin,
                modal.type,
                quantity,
                price,
                modal.transaction?.id
              );
            }}
          >
            <FaCheck /> Подтвердить
          </button>
          <button
            className="action-button"
            onClick={() =>
              setModal({ isOpen: false, coin: "", type: "", transaction: null })
            }
          >
            <FaTimes /> Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;
