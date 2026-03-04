require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static('public'));

const db = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'x3dh_messenger'
});

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_keys_2025';

async function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.sendStatus(401);
    const token = authHeader.split(' ')[1];
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) { res.sendStatus(401); }
}

app.post('/api/register', async (req, res) => {
  const { username, password, identityKey, signedPrekey, signature } = req.body;
  const hash = await bcrypt.hash(password, 10);
  await db.query(`INSERT INTO users (username, password_hash, identity_key, signed_prekey, signed_prekey_signature) VALUES (?, ?, ?, ?, ?)`, 
    [username, hash, identityKey, signedPrekey, signature]);
  res.json({ success: true });
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const [[user]] = await db.query(`SELECT * FROM users WHERE username=?`, [username]);
  if (!user || !(await bcrypt.compare(password, user.password_hash))) return res.sendStatus(401);
  const token = jwt.sign({ id: user.id }, JWT_SECRET);
  res.json({ token });
});

app.get('/api/users', auth, async (req, res) => {
  const [rows] = await db.query(`SELECT id, username FROM users WHERE id != ?`, [req.user.id]);
  res.json(rows);
});

// THIS IS THE CRITICAL FIX FOR HISTORY
app.get('/api/messages/:id', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT m.*, u.username AS sender_name 
       FROM messages m 
       JOIN users u ON m.sender_id = u.id 
       WHERE (m.sender_id = ? AND m.recipient_id = ?) 
          OR (m.sender_id = ? AND m.recipient_id = ?) 
       ORDER BY m.id ASC`, 
      [req.user.id, req.params.id, req.params.id, req.user.id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: "History Load Error" }); }
});

app.post('/api/message', auth, async (req, res) => {
  const { recipientId, ciphertext, ephemeralKey } = req.body;
  await db.query(`INSERT INTO messages (sender_id, recipient_id, ciphertext, ephemeral_key) VALUES (?, ?, ?, ?)`, 
    [req.user.id, recipientId, ciphertext, ephemeralKey]);
  res.json({ success: true });
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ SERVER RUNNING: http://localhost:${PORT}`);
});