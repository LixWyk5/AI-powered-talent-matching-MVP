const express = require('express');
const db = require('../db/connect');
const { getWelcomeMessage } = require('./tools');
const router = express.Router();

router.post('/init', (req, res) => {
  const { userId, role, botName, taskType } = req.body;
  const tableName = `messages_${botName.toLowerCase()}`;

  const checkSql = 'SELECT id FROM conversations WHERE user_id = ? AND user_role = ? AND bot_name = ?';
  db.query(checkSql, [userId, role, botName], (err, results) => {
    if (err) return res.status(500).json({ error: err });

    if (results.length > 0) {
      const conversationId = results[0].id;
      const msgSql = `SELECT * FROM ${tableName} WHERE conversation_id = ? ORDER BY timestamp ASC`;
      db.query(msgSql, [conversationId], (err2, msgResults) => {
        if (err2) return res.status(500).json({ error: err2 });
        const messages = msgResults.map(m => ({ role: m.type === 'send' ? 'ai' : 'user', text: m.content, name: botName }));
        return res.json({ conversationId, messages });
      });
    } else {
      const insertConversation = 'INSERT INTO conversations (bot_name, user_role, user_id) VALUES (?, ?, ?)';
      db.query(insertConversation, [botName, role, userId], (err3, insertResult) => {
        if (err3) return res.status(500).json({ error: err3 });
        const conversationId = insertResult.insertId;

        const welcome = getWelcomeMessage(botName);
        const insertMsgSql = `INSERT INTO ${tableName} (conversation_id, type, content) VALUES (?, 'send', ?)`;
        db.query(insertMsgSql, [conversationId, welcome], (err4) => {
          if (err4) return res.status(500).json({ error: err4 });
          return res.json({ conversationId, messages: [{ role: 'ai', text: welcome, name: botName }] });
        });
      });
    }
  });
});

router.post('/:bot', (req, res) => {
  const { bot } = req.params;
  const { conversationId, type, content } = req.body;
  const tableName = `messages_${bot.toLowerCase()}`;
  const sql = `INSERT INTO ${tableName} (conversation_id, type, content) VALUES (?, ?, ?)`;
  db.query(sql, [conversationId, type, content], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.sendStatus(200);
  });
});

router.post('/:bot/clear', (req, res) => {
  const { bot } = req.params;
  const { conversationId, userId, botName, role } = req.body;
  const tableName = `messages_${bot.toLowerCase()}`;

  db.query('DELETE FROM conversations WHERE id = ?', [conversationId], (err) => {
    if (err) return res.status(500).json({ error: err });

    const insertConversation = 'INSERT INTO conversations (bot_name, user_role, user_id) VALUES (?, ?, ?)';
    db.query(insertConversation, [botName, role, userId], (err2, insertResult) => {
      if (err2) return res.status(500).json({ error: err2 });
      const newConversationId = insertResult.insertId;

      const welcome = getWelcomeMessage(botName);
      const insertMsgSql = `INSERT INTO ${tableName} (conversation_id, type, content) VALUES (?, 'send', ?)`;
      db.query(insertMsgSql, [newConversationId, welcome], (err3) => {
        if (err3) return res.status(500).json({ error: err3 });
        return res.json({ newConversationId, newMessages: [{ role: 'ai', text: welcome, name: botName }] });
      });
    });
  });
});

module.exports = router;
