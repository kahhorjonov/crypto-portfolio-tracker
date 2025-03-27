import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaPlus,
  FaTrash,
  FaEdit,
  FaHistory,
  FaCheck,
  FaTimes,
  FaMinus,
} from "react-icons/fa";
import "./App.css";

function App() {
  const [portfolio, setPortfolio] = useState({});
  const [prices, setPrices] = useState({});
  const [modal, setModal] = useState({
    isOpen: false,
    coin: "",
    type: "",
    transaction: null,
  });
  const [historyModal, setHistoryModal] = useState({ isOpen: false, coin: "" });
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    coin: "",
    id: null,
  });
  const [newCoin, setNewCoin] = useState("");

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const response = await axios.get("http://localhost:4000/portfolio");
        setPortfolio(response.data);
      } catch (error) {
        console.error("Portfelni olishda xatolik:", error);
      }
    };
    fetchPortfolio();
  }, []);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:4000");
    ws.onopen = () => console.log("WebSocket ulandi");
    ws.onmessage = (event) => setPrices(JSON.parse(event.data));
    ws.onerror = (error) => console.error("WebSocket xatosi:", error);
    ws.onclose = () => console.log("WebSocket uzildi");
    return () => ws.close();
  }, []);

  const handleTransaction = async (coin, type, quantity, price, id = null) => {
    try {
      if (id) {
        const response = await axios.put(
          `http://localhost:4000/portfolio/${coin}/${id}`,
          { type, quantity, price }
        );
        setPortfolio((prev) => ({
          ...prev,
          [coin]: prev[coin].map((t) => (t.id === id ? response.data : t)),
        }));
      } else {
        const response = await axios.post(
          `http://localhost:4000/portfolio/${coin}`,
          { type, quantity, price }
        );
        setPortfolio((prev) => ({
          ...prev,
          [coin]: [...prev[coin], response.data],
        }));
      }
      setModal({ isOpen: false, coin: "", type: "", transaction: null });
    } catch (error) {
      console.error("Tranzaksiyada xatolik:", error);
    }
  };

  const deleteTransaction = async (coin, id) => {
    try {
      await axios.delete(`http://localhost:4000/portfolio/${coin}/${id}`);
      setPortfolio((prev) => ({
        ...prev,
        [coin]: prev[coin].filter((t) => t.id !== id),
      }));
      setDeleteModal({ isOpen: false, coin: "", id: null });
      setHistoryModal({ isOpen: false, coin: "" });
    } catch (error) {
      console.error("O‘chirishda xatolik:", error);
    }
  };

  const addCoin = async () => {
    try {
      const symbol = newCoin.toUpperCase();
      await axios.post("http://localhost:4000/add-coin", { symbol });
      setPortfolio((prev) => ({ ...prev, [symbol]: [] }));
      setNewCoin("");
    } catch (error) {
      console.error("Coin qo‘shishda xatolik:", error);
    }
  };

  const removeCoin = async (coin) => {
    try {
      await axios.delete(`http://localhost:4000/remove-coin/${coin}`);
      setPortfolio((prev) => {
        const newPortfolio = { ...prev };
        delete newPortfolio[coin];
        return newPortfolio;
      });
    } catch (error) {
      console.error("Coin o‘chirishda xatolik:", error);
    }
  };

  const calculateAveragePrice = (coin) => {
    const transactions = portfolio[coin] || [];
    if (!transactions.length) return 0;
    const totalSpent = transactions
      .filter((t) => t.type === "buy")
      .reduce((sum, t) => sum + t.quantity * t.price, 0);
    const totalQuantity = transactions
      .filter((t) => t.type === "buy")
      .reduce((sum, t) => sum + t.quantity, 0);
    return totalQuantity ? totalSpent / totalQuantity : 0;
  };

  const calculateCurrentQuantity = (coin) => {
    const transactions = portfolio[coin] || [];
    return transactions.reduce(
      (sum, t) => (t.type === "buy" ? sum + t.quantity : sum - t.quantity),
      0
    );
  };

  const calculateProfitLoss = (coin) => {
    const transactions = portfolio[coin] || [];
    const totalBought = transactions
      .filter((t) => t.type === "buy")
      .reduce((sum, t) => sum + t.quantity * t.price, 0);
    const totalSold = transactions
      .filter((t) => t.type === "sell")
      .reduce((sum, t) => sum + t.quantity * t.price, 0);
    const currentQuantity = calculateCurrentQuantity(coin);
    const currentValue = currentQuantity * (prices[coin] || 0);
    const profitLoss = currentValue + totalSold - totalBought;
    const profitLossPercentage = totalBought
      ? (profitLoss / totalBought) * 100
      : 0;
    return { profitLoss, profitLossPercentage };
  };

  const calculateTotalProfitLoss = () => {
    let totalProfitLoss = 0;
    Object.keys(portfolio).forEach((coin) => {
      const { profitLoss } = calculateProfitLoss(coin);
      totalProfitLoss += profitLoss;
    });
    return totalProfitLoss;
  };

  return (
    <div className="App">
      <h1>Kripto Portfel Tracker</h1>
      <div className="coin-management">
        <input
          type="text"
          value={newCoin}
          onChange={(e) => setNewCoin(e.target.value)}
          placeholder="Yangi coin (masalan, BTC)"
        />
        <button onClick={addCoin}>
          <FaPlus /> Coin Qo‘shish
        </button>
      </div>
      <table>
        <thead>
          <tr>
            <th>COIN</th>
            <th>JORIY MIQDOR</th>
            <th>O‘RTACHA NARX (USDT)</th>
            <th>JORIY NARX (USDT)</th>
            <th>FOYDA/ZARAR (USDT)</th>
            <th>FOYDA/ZARAR (%)</th>
            <th>AMALLAR</th>
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
                <td>{currentQuantity}</td>
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
                    <FaPlus /> Sotib Olish
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
                    <FaMinus /> Sotish
                  </button>
                  <button
                    className="history-btn"
                    onClick={() => setHistoryModal({ isOpen: true, coin })}
                  >
                    <FaHistory /> Tarix
                  </button>
                  <button
                    className="remove-btn"
                    onClick={() => removeCoin(coin)}
                  >
                    <FaTrash /> O‘chirish
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="total-profit-loss">
        <h3>
          Umumiy Foyda/Zarar:
          <span className={calculateTotalProfitLoss() >= 0 ? "profit" : "loss"}>
            {calculateTotalProfitLoss() >= 0 ? <FaCheck /> : <FaTimes />}
            {calculateTotalProfitLoss().toFixed(4)} USDT
          </span>
        </h3>
      </div>

      {modal.isOpen && (
        <div className="modal" style={{ zIndex: 1000 }}>
          <div className="modal-content">
            <h2>
              {modal.type === "buy" ? "Sotib Olish" : "Sotish"} - {modal.coin}
            </h2>

            <input
              type="number"
              placeholder="Miqdor"
              id="quantity"
              defaultValue={modal.transaction?.quantity || ""}
            />

            <input
              type="number"
              placeholder="Narx (USDT)"
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
                <FaCheck /> Tasdiqlash
              </button>

              <button
                className="action-button"
                onClick={() =>
                  setModal({
                    isOpen: false,
                    coin: "",
                    type: "",
                    transaction: null,
                  })
                }
              >
                <FaTimes /> Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {historyModal.isOpen && (
        <div className="modal" style={{ zIndex: 900 }}>
          <div className="modal-content">
            <h2>{historyModal.coin} - Tranzaksiyalar Tarixi</h2>
            <table>
              <thead>
                <tr>
                  <th>Turi</th>
                  <th>Miqdor</th>
                  <th>Narx (USDT)</th>
                  <th>Sana</th>
                  <th>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {portfolio[historyModal.coin]?.map((t) => (
                  <tr key={t.id}>
                    <td>{t.type === "buy" ? "Sotib Olish" : "Sotish"}</td>
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
                        <FaEdit /> Tahrirlash
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
                        <FaTrash /> O‘chirish
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
              <FaTimes /> Yopish
            </button>
          </div>
        </div>
      )}

      {deleteModal.isOpen && (
        <div className="modal" style={{ zIndex: 1100 }}>
          <div className="modal-content">
            <h2>Tranzaksiyani o‘chirishni tasdiqlaysizmi?</h2>
            <button
              onClick={() =>
                deleteTransaction(deleteModal.coin, deleteModal.id)
              }
            >
              <FaCheck /> Ha
            </button>
            <button
              onClick={() =>
                setDeleteModal({ isOpen: false, coin: "", id: null })
              }
            >
              <FaTimes /> Yo‘q
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
