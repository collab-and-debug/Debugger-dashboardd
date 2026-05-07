const express = require('express');
const router  = express.Router();
const crypto  = require('crypto');
const { sessions } = require('../websocket/handler');

router.post('/create', (req, res) => {
  const sessionId = crypto.randomUUID();
  res.json({
    sessionId,
    wsUrl: `ws://localhost:${process.env.PORT || 8080}?session=${sessionId}`,
    createdAt: Date.now(),
  });
});

router.post('/join', (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) return res.status(400).json({ error: 'sessionId is required' });
  const clientCount = sessions.has(sessionId) ? sessions.get(sessionId).size : 0;
  res.json({ sessionId, clientCount, joined: true });
});

router.get('/:id/status', (req, res) => {
  const { id } = req.params;
  if (!sessions.has(id)) return res.status(404).json({ error: 'Session not found' });
  res.json({ sessionId: id, clientCount: sessions.get(id).size, active: true });
});

module.exports = router;
