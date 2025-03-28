import React, { useState } from "react";
import { loginUser, registerUser } from "./services/api";
import "./Login.css";

function Login({ setToken }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const response = await loginUser(username, password);
      setToken(response.data.token);
      localStorage.setItem("token", response.data.token);
    } catch (err) {
      setError("Неверный логин или пароль");
    }
  };

  const handleRegister = async () => {
    try {
      await registerUser(username, password);
      alert("Пользователь успешно зарегистрирован! Теперь войдите.");
    } catch (err) {
      setError("Ошибка при регистрации. Пользователь уже существует.");
    }
  };

  return (
    <div className="login-container">
      <h2>Вход</h2>
      {error && <p className="error">{error}</p>}
      <input
        type="text"
        placeholder="Логин"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Пароль"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Войти</button>
      <button onClick={handleRegister}>Зарегистрироваться</button>
    </div>
  );
}

export default Login;
