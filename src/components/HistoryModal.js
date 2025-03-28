import { FaEdit, FaTimes, FaTrash } from "react-icons/fa";
import "./styles/HistoryModal.css";

const HistoryModal = ({
  historyModal,
  portfolio,
  setModal,
  setHistoryModal,
  setDeleteModal,
}) => {
  if (!historyModal.isOpen) return null;

  return (
    <div className="modal" style={{ zIndex: 900 }}>
      <div className="modal-content">
        <h2>{historyModal.coin} - История Транзакций</h2>
        <table>
          <thead>
            <tr>
              <th>Тип</th>
              <th>Количество</th>
              <th>Цена (USDT)</th>
              <th>Дата</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {portfolio[historyModal.coin]?.map((t) => (
              <tr key={t.id}>
                <td>{t.type === "buy" ? "Покупка" : "Продажа"}</td>
                <td>{t.quantity}</td>
                <td>{t.price}</td>
                <td>{new Date(t.date).toLocaleString()}</td>
                <td>
                  <button
                    className="action-button"
                    onClick={() =>
                      setModal({
                        isOpen: true,
                        coin: historyModal.coin,
                        type: t.type,
                        transaction: t,
                      })
                    }
                  >
                    <FaEdit /> Редактировать
                  </button>
                  <button
                    className="action-button"
                    onClick={() =>
                      setDeleteModal({
                        isOpen: true,
                        coin: historyModal.coin,
                        id: t.id,
                      })
                    }
                  >
                    <FaTrash /> Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          className="action-button"
          onClick={() => setHistoryModal({ isOpen: false, coin: "" })}
        >
          <FaTimes /> Закрыть
        </button>
      </div>
    </div>
  );
};

export default HistoryModal;
