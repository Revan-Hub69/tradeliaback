// routes/chat.js
const express = require('express');
const router = express.Router();
const { sendMessageToAssistant } = require('../services/openai');

router.post('/', async (req, res) => {
  try {
    const { message, thread_id, file_ids } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Messaggio mancante' });
    }

    const aiResponse = await sendMessageToAssistant({ message, thread_id, file_ids });
    res.json(aiResponse);
  } catch (error) {
    console.error('Errore nella route /chat:', error);
    res.status(500).json({ error: 'Errore interno nella chat AI' });
  }
});

module.exports = router;
