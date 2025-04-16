const express = require('express');
const router = express.Router();
const db = require('../db/connect');

// Sign up
router.post('/signup', (req, res) => {
  const { username, password, location, company, role } = req.body;

  if (!username || !password || !role || 
      (role === 'candidate' && !location) || 
      (role === 'employer' && !company)) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  const table = role === 'employer' ? 'employers' : 'candidates';
  const uniqueField = role === 'employer' ? 'company_name' : 'location';
  const uniqueValue = role === 'employer' ? company : location;

  // 检查用户名是否存在
  db.query(`SELECT * FROM ${table} WHERE username = ?`, [username], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }
    if (results.length > 0) {
      return res.status(409).json({ message: 'Username already exists' });
    }

    // 插入新用户
    db.query(
      `INSERT INTO ${table} (username, password, ${uniqueField}) VALUES (?, ?, ?)`,
      [username, password, uniqueValue],
      (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Insert failed' });
        }
        res.json({ message: 'Sign up successful' });
      }
    );
  });
});

// Log in
router.post('/login', (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ message: 'Missing login fields' });
  }

  const table = role === 'employer' ? 'employers' : 'candidates';

  db.query(
    `SELECT * FROM ${table} WHERE username = ? AND password = ?`,
    [username, password],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Database error' });
      }

      if (results.length === 0) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      res.json({ message: 'Login successful', user: {
        id: results[0].id,
        username,
        role
      } });
    }
  );
});

module.exports = router;
