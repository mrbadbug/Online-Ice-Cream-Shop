const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));
app.use('/images', express.static(path.join(__dirname, 'images')));

const db = new sqlite3.Database('shop.db');

db.run(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    items TEXT NOT NULL,
    total_quantity INTEGER NOT NULL,
    total_price REAL NOT NULL,
    status TEXT DEFAULT 'Unpaid',
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

app.post('/api/orders', (req, res) => {
  const { items, total_quantity, total_price } = req.body;
  db.run(
    `INSERT INTO orders (items, total_quantity, total_price) VALUES (?,?,?)`,
    [items, total_quantity, total_price],
    function (err) {
      if (err) return res.status(500).send(err.message);
      res.json({ orderId: this.lastID });
    }
  );
});

app.get('/api/orders', (req, res) => {
  db.all(`SELECT * FROM orders ORDER BY id DESC`, [], (err, rows) => {
    if (err) return res.status(500).send(err.message);
    res.json(rows);
  });
});

app.post('/api/orders/:id/pay', (req, res) => {
  const orderId = req.params.id;
  db.run(
    `UPDATE orders SET status='Paid' WHERE id=?`,
    [orderId],
    function (err) {
      if (err) return res.status(500).send(err.message);
      res.json({ message: `Order #${orderId} marked Paid` });
    }
  );
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
