import axios from "axios";
import { API_BASE_URL } from "../constants/config";

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const loginUser = async (username, password) => {
  return api.post("/login", { username, password });
};

export const registerUser = async (username, password) => {
  return api.post("/register", { username, password });
};

export const fetchPortfolio = async (token) => {
  return api.get("/portfolio", {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const addTransaction = async (coin, type, quantity, price, token) => {
  return api.post(
    `/portfolio/${coin}`,
    { type, quantity, price },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const updateTransaction = async (
  coin,
  id,
  type,
  quantity,
  price,
  token
) => {
  return api.put(
    `/portfolio/${coin}/${id}`,
    { type, quantity, price },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const deleteTransaction = async (coin, id, token) => {
  return api.delete(`/portfolio/${coin}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const addCoin = async (symbol, token) => {
  return api.post(
    "/add-coin",
    { symbol },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const removeCoin = async (symbol, token) => {
  return api.delete(`/remove-coin/${symbol}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
