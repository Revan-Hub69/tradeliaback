// routes/chat.js
const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');
const { resolveTools } = require('../services/toolDispatcher');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const assistantId = process.env.ASSISTANT_ID;
const threads = new Map(); // in memoria

router.post('/', async (req, res) => {
  try {
    const { message, userId = 'default' } = req.body;
    if (!message) return res.status(400).json({ error: 'Messaggio mancante' });

    // Recupera o crea il thread
    let threadId = threads.get(userId);
    if (!threadId) {
      const thread = await openai.beta.threads.create();
      threadId = thread.id;
      threads.set(userId, threadId);
    }

    // Invia messaggio al thread
    await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: message
    });

    // Avvia la run CON tool attivi
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: assistantId
    });

    let status = run.status;
    let attempts = 0;
    const maxAttempts = 25;

    while (status !== 'completed' && attempts < maxAttempts) {
      await new Promise(r => setTimeout(r, 1000));
      const updated = await openai.beta.threads.runs.retrieve(threadId, run.id);
      status = updated.status;

      // 🔁 TOOL CALL HANDLING
      if (status === "requires_action") {
        const toolCalls = updated.required_action.submit_tool_outputs.tool_calls;
        const outputs = await resolveTools(toolCalls);
        await openai.beta.threads.runs.submitToolOutputs(threadId, run.id, {
          tool_outputs: outputs
        });
      }

      attempts++;
    }

    if (status !== 'completed') {
      return res.status(500).json({ error: 'Timeout assistant dopo 25s' });
    }

    const messages = await openai.beta.threads.messages.list(threadId);
    const last = messages.data.find(m => m.role === 'assistant' && m.run_id === run.id);

    return res.json({
      response: last?.content?.[0]?.text?.value || '✅ Risposta ricevuta.'
    });

  } catch (err) {
    console.error('Errore Assistant:', err.message);
    return res.status(500).json({ error: 'Errore nella chat AI' });
  }
});

module.exports = router;
