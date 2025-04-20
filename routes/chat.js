const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const assistantId = process.env.ASSISTANT_ID;

const threads = new Map(); // Mappa per salvare i thread temporanei per utente

router.post('/', async (req, res) => {
  try {
    const { message, userId = 'default' } = req.body;
    if (!message) return res.status(400).json({ error: 'Messaggio mancante' });

    // Thread: crea uno nuovo o riusa il vecchio per questo utente
    let threadId = threads.get(userId);
    if (!threadId) {
      const thread = await openai.beta.threads.create();
      threadId = thread.id;
      threads.set(userId, threadId);
    }

    // Invia messaggio utente
    await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: message
    });

    // Avvia la run dell'assistente
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: assistantId
    });

    // Polling per attendere completamento
    let status = run.status;
    let attempts = 0;
    const maxAttempts = 10;
    while (status !== 'completed' && attempts < maxAttempts) {
      await new Promise(r => setTimeout(r, 2000));
      const updated = await openai.beta.threads.runs.retrieve(threadId, run.id);
      status = updated.status;
      attempts++;
    }

    if (status !== 'completed') {
      return res.status(500).json({ error: 'Assistant timeout dopo 20s' });
    }

    // Estrai la risposta dell'assistente
    const messages = await openai.beta.threads.messages.list(threadId);
    const last = messages.data.find(m => m.role === 'assistant');

    return res.json({ response: last?.content?.[0]?.text?.value || '✅ Risposta generata.' });

  } catch (err) {
    console.error('Errore Assistant:', err.message);
    return res.status(500).json({ error: 'Errore nel backend Assistant.' });
  }
});

module.exports = router;
