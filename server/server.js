const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const WebSocket = require("ws");
const app = express();
const port = 4000;

app.use(express.json());
app.use(cors());

const db = new sqlite3.Database("./portfolio.db", (err) => {
  if (err) console.error("DB xatosi:", err.message);
  console.log("SQLite DB ulandi");
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS coins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      symbol TEXT UNIQUE
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      coin_id INTEGER,
      type TEXT,
      quantity REAL,
      price REAL,
      date TEXT,
      FOREIGN KEY (coin_id) REFERENCES coins(id)
    )
  `);

  const initialCoins = [
    "BTC",
    "ETH",
    "XRP",
    "SOL",
    "HBAR",
    "NEAR",
    "TIA",
    "TON",
    "ENA",
    "CAKE",
    "SEI",
    "KAITO",
    "BERA",
  ];
  initialCoins.forEach((coin) => {
    db.run(`INSERT OR IGNORE INTO coins (symbol) VALUES (?)`, [coin]);
  });
});

app.get("/portfolio", (req, res) => {
  db.all(
    `
    SELECT c.symbol, t.id, t.type, t.quantity, t.price, t.date
    FROM coins c
    LEFT JOIN transactions t ON c.id = t.coin_id
  `,
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      const portfolio = {};
      rows.forEach((row) => {
        if (!portfolio[row.symbol]) portfolio[row.symbol] = [];
        if (row.id) {
          portfolio[row.symbol].push({
            id: row.id,
            type: row.type,
            quantity: row.quantity,
            price: row.price,
            date: row.date,
          });
        }
      });
      res.json(portfolio);
    }
  );
});

app.post("/portfolio/:coin", (req, res) => {
  const { coin } = req.params;
  const { type, quantity, price } = req.body;
  db.get(`SELECT id FROM coins WHERE symbol = ?`, [coin], (err, row) => {
    if (err || !row) return res.status(404).json({ error: "Coin topilmadi" });
    const coinId = row.id;
    db.run(
      `INSERT INTO transactions (coin_id, type, quantity, price, date) VALUES (?, ?, ?, ?, ?)`,
      [coinId, type, quantity, price, new Date().toISOString()],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({
          id: this.lastID,
          type,
          quantity,
          price,
          date: new Date().toISOString(),
        });
      }
    );
  });
});

app.put("/portfolio/:coin/:id", (req, res) => {
  const { coin, id } = req.params;
  const { type, quantity, price } = req.body;
  db.get(`SELECT id FROM coins WHERE symbol = ?`, [coin], (err, row) => {
    if (err || !row) return res.status(404).json({ error: "Coin topilmadi" });
    db.run(
      `UPDATE transactions SET type = ?, quantity = ?, price = ? WHERE id = ? AND coin_id = ?`,
      [type, quantity, price, id, row.id],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: Number(id), type, quantity, price });
      }
    );
  });
});

app.delete("/portfolio/:coin/:id", (req, res) => {
  const { coin, id } = req.params;
  db.get(`SELECT id FROM coins WHERE symbol = ?`, [coin], (err, row) => {
    if (err || !row) return res.status(404).json({ error: "Coin topilmadi" });
    db.run(
      `DELETE FROM transactions WHERE id = ? AND coin_id = ?`,
      [id, row.id],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Tranzaksiya o‘chirildi" });
      }
    );
  });
});

app.post("/add-coin", (req, res) => {
  const { symbol } = req.body;
  db.run(
    `INSERT OR IGNORE INTO coins (symbol) VALUES (?)`,
    [symbol.toUpperCase()],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: `${symbol} qo‘shildi` });
    }
  );
});

app.delete("/remove-coin/:symbol", (req, res) => {
  const { symbol } = req.params;
  db.run(`DELETE FROM coins WHERE symbol = ?`, [symbol], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    db.run(
      `DELETE FROM transactions WHERE coin_id IN (SELECT id FROM coins WHERE symbol = ?)`,
      [symbol],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: `${symbol} o‘chirildi` });
      }
    );
  });
});

const server = app.listen(port, () => {
  console.log(`HTTP Server http://localhost:${port} da ishlamoqda`);
});

const wss = new WebSocket.Server({ server });

const coinPairs = [
  "btcusdt",
  "ethusdt",
  "xrpusdt",
  "solusdt",
  "hbarusdt",
  "nearusdt",
  "tiausdt",
  "tonusdt",
  "enausdt",
  "cakeusdt",
  "seiusdt",
  "kaitousdt",
  "berausdt",
];

let prices = {
  BTC: 0,
  ETH: 0,
  XRP: 0,
  SOL: 0,
  HBAR: 0,
  NEAR: 0,
  TIA: 0,
  TON: 0,
  ENA: 0,
  CAKE: 0,
  SEI: 0,
  KAITO: 0,
  BERA: 0,
};

const connectToBinanceWebSocket = () => {
  const ws = new WebSocket(
    "wss://stream.binance.com:9443/stream?streams=" +
      coinPairs.map((pair) => `${pair}@ticker`).join("/")
  );

  ws.on("open", () => console.log("Binance WebSocket ulandi"));

  ws.on("message", (data) => {
    const message = JSON.parse(data);
    const ticker = message.data;
    if (ticker && ticker.s) {
      const symbol = ticker.s.replace("USDT", "").toUpperCase();
      const price = parseFloat(ticker.c);
      prices[symbol] = price;
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN)
          client.send(JSON.stringify(prices));
      });
    }
  });

  ws.on("error", (error) => console.error("WebSocket xatosi:", error.message));
  ws.on("close", () => {
    console.log("Binance WebSocket uzildi, qayta ulanmoqda...");
    setTimeout(connectToBinanceWebSocket, 1000);
  });
};

connectToBinanceWebSocket();

wss.on("connection", (ws) => {
  console.log("Yangi mijoz ulandi");
  ws.send(JSON.stringify(prices));
  ws.on("close", () => console.log("Mijoz uzildi"));
});
