import {
  FaCheck,
  FaHistory,
  FaMinus,
  FaPlus,
  FaTimes,
  FaTrash,
} from "react-icons/fa";
import "./styles/PortfolioTable.css";

const PortfolioTable = ({
  portfolio,
  prices,
  setModal,
  setHistoryModal,
  setDeleteCoinModal,
  calculateAveragePrice,
  calculateCurrentQuantity,
  calculateProfitLoss,
  calculateTotalProfitLoss,
}) => {
  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>МОНЕТА</th>
            <th>ТЕКУЩЕЕ КОЛИЧЕСТВО</th>
            <th>СРЕДНЯЯ ЦЕНА (USDT)</th>
            <th>ТЕКУЩАЯ ЦЕНА (USDT)</th>
            <th>ПРИБЫЛЬ/УБЫТОК (USDT)</th>
            <th>ПРИБЫЛЬ/УБЫТОК (%)</th>
            <th>ДЕЙСТВИЯ</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(portfolio).map((coin) => {
            const avgPrice = calculateAveragePrice(coin);
            const currentQuantity = calculateCurrentQuantity(coin);
            const currentPrice = prices[coin] || 0;
            const { profitLoss, profitLossPercentage } =
              calculateProfitLoss(coin);

            return (
              <tr key={coin}>
                <td>{coin}</td>
                <td>{currentQuantity.toFixed(4)}</td>
                <td>{avgPrice.toFixed(4)}</td>
                <td>{currentPrice.toFixed(4)}</td>
                <td>
                  <p className={profitLoss >= 0 ? "profit" : "loss"}>
                    {profitLoss >= 0 ? <FaCheck /> : <FaTimes />}
                    {profitLoss.toFixed(4)} USDT
                  </p>
                </td>
                <td>
                  <p className={profitLossPercentage >= 0 ? "profit" : "loss"}>
                    {profitLossPercentage >= 0 ? <FaCheck /> : <FaTimes />}
                    {profitLossPercentage.toFixed(2)}%
                  </p>
                </td>
                <td className="actions">
                  <button
                    className="buy-btn"
                    onClick={() =>
                      setModal({
                        isOpen: true,
                        coin,
                        type: "buy",
                        transaction: null,
                      })
                    }
                  >
                    <FaPlus /> Купить
                  </button>
                  <button
                    className="sell-btn"
                    onClick={() =>
                      setModal({
                        isOpen: true,
                        coin,
                        type: "sell",
                        transaction: null,
                      })
                    }
                  >
                    <FaMinus /> Продать
                  </button>
                  <button
                    className="history-btn"
                    onClick={() => setHistoryModal({ isOpen: true, coin })}
                  >
                    <FaHistory /> История
                  </button>
                  <button
                    className="remove-btn"
                    onClick={() => setDeleteCoinModal({ isOpen: true, coin })}
                  >
                    <FaTrash /> Удалить
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="total-profit-loss">
        <h3>
          Общая Прибыль/Убыток:
          <span className={calculateTotalProfitLoss() >= 0 ? "profit" : "loss"}>
            {calculateTotalProfitLoss() >= 0 ? <FaCheck /> : <FaTimes />}
            {calculateTotalProfitLoss().toFixed(4)} USDT
          </span>
        </h3>
      </div>
    </div>
  );
};

export default PortfolioTable;
