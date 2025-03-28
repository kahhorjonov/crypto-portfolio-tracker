import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from "react";
import { FaSignOutAlt, FaUser } from "react-icons/fa";
import "./App.css";
import Login from "./Login";
import CoinManagement from "./components/CoinManagement";
import DeleteCoinModal from "./components/DeleteCoinModal";
import DeleteModal from "./components/DeleteModal";
import HistoryModal from "./components/HistoryModal";
import PortfolioTable from "./components/PortfolioTable";
import TransactionModal from "./components/TransactionModal";
import { WEBSOCKET_URL } from "./constants/config";
import {
  addTransaction,
  deleteTransaction,
  fetchPortfolio,
  removeCoin,
  updateTransaction,
} from "./services/api";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [username, setUsername] = useState("");
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
  const [deleteCoinModal, setDeleteCoinModal] = useState({
    isOpen: false,
    coin: "",
  });

  useEffect(() => {
    if (token) {
      const decoded = jwtDecode(token);
      setUsername(decoded.username);
      const fetchPortfolioData = async () => {
        try {
          const response = await fetchPortfolio(token);
          setPortfolio(response.data);
        } catch (error) {
          console.error("Ошибка при получении портфеля:", error);
          if (
            error.response?.status === 401 ||
            error.response?.status === 403
          ) {
            handleLogout();
          }
        }
      };
      fetchPortfolioData();
    }
  }, [token]);

  useEffect(() => {
    const ws = new WebSocket(WEBSOCKET_URL);
    ws.onopen = () => console.log("WebSocket подключен");
    ws.onmessage = (event) => setPrices(JSON.parse(event.data));
    ws.onerror = (error) => console.error("Ошибка WebSocket:", error);
    ws.onclose = () => console.log("WebSocket отключен");
    return () => ws.close();
  }, []);

  const handleTransaction = async (coin, type, quantity, price, id = null) => {
    try {
      if (id) {
        const response = await updateTransaction(
          coin,
          id,
          type,
          quantity,
          price,
          token
        );
        setPortfolio((prev) => ({
          ...prev,
          [coin]: prev[coin].map((t) => (t.id === id ? response.data : t)),
        }));
      } else {
        const response = await addTransaction(
          coin,
          type,
          quantity,
          price,
          token
        );
        setPortfolio((prev) => ({
          ...prev,
          [coin]: [...prev[coin], response.data],
        }));
      }
      setModal({ isOpen: false, coin: "", type: "", transaction: null });
    } catch (error) {
      console.error("Ошибка при транзакции:", error);
    }
  };

  const handleDeleteTransaction = async (coin, id) => {
    try {
      await deleteTransaction(coin, id, token);
      setPortfolio((prev) => ({
        ...prev,
        [coin]: prev[coin].filter((t) => t.id !== id),
      }));
      setDeleteModal({ isOpen: false, coin: "", id: null });
      setHistoryModal({ isOpen: false, coin: "" });
    } catch (error) {
      console.error("Ошибка при удалении:", error);
    }
  };

  const handleRemoveCoin = async (coin) => {
    try {
      await removeCoin(coin, token);
      setPortfolio((prev) => {
        const newPortfolio = { ...prev };
        delete newPortfolio[coin];
        return newPortfolio;
      });
      setDeleteCoinModal({ isOpen: false, coin: "" });
    } catch (error) {
      console.error("Ошибка при удалении монеты:", error);
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

  const handleLogout = () => {
    setToken("");
    setUsername("");
    localStorage.removeItem("token");
  };

  if (!token) {
    return <Login setToken={setToken} />;
  }

  return (
    <div className="App">
      <div className="header">
        <h1>Крипто Портфель Трекер</h1>
        <div className="user-info">
          <span className="username">
            <FaUser /> {username}
          </span>
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt /> Выйти
          </button>
        </div>
      </div>
      <CoinManagement token={token} setPortfolio={setPortfolio} />
      <PortfolioTable
        portfolio={portfolio}
        prices={prices}
        setModal={setModal}
        setHistoryModal={setHistoryModal}
        setDeleteCoinModal={setDeleteCoinModal}
        calculateAveragePrice={calculateAveragePrice}
        calculateCurrentQuantity={calculateCurrentQuantity}
        calculateProfitLoss={calculateProfitLoss}
        calculateTotalProfitLoss={calculateTotalProfitLoss}
      />
      <TransactionModal
        modal={modal}
        setModal={setModal}
        handleTransaction={handleTransaction}
      />
      <HistoryModal
        historyModal={historyModal}
        portfolio={portfolio}
        setModal={setModal}
        setHistoryModal={setHistoryModal}
        setDeleteModal={setDeleteModal}
      />
      <DeleteModal
        deleteModal={deleteModal}
        setDeleteModal={setDeleteModal}
        deleteTransaction={handleDeleteTransaction}
      />
      <DeleteCoinModal
        deleteCoinModal={deleteCoinModal}
        setDeleteCoinModal={setDeleteCoinModal}
        removeCoin={handleRemoveCoin}
      />
    </div>
  );
}

export default App;
