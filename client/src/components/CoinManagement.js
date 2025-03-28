import React, { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { addCoin } from "../services/api";
import "./styles/CoinManagement.css";

const CoinManagement = ({ token, setPortfolio }) => {
  const [newCoin, setNewCoin] = useState("");

  const handleAddCoin = async () => {
    if (!newCoin.trim()) {
      alert("Пожалуйста, введите символ монеты!");
      return;
    }
    try {
      const symbol = newCoin.toUpperCase();
      await addCoin(symbol, token);
      setPortfolio((prev) => ({ ...prev, [symbol]: [] }));
      setNewCoin("");
    } catch (error) {
      console.error("Ошибка при добавлении монеты:", error);
    }
  };

  return (
    <div className="coin-management">
      <input
        type="text"
        value={newCoin}
        onChange={(e) => setNewCoin(e.target.value)}
        placeholder="Новая монета (например, BTC)"
      />
      <button onClick={handleAddCoin}>
        <FaPlus /> Добавить Монету
      </button>
    </div>
  );
};

export default CoinManagement;
