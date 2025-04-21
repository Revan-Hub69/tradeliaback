const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');
const { resolveTools } = require('../services/toolDispatcher');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const assistantId = process.env.ASSISTANT_ID;

router.post('/', async (req, res) => {
  try {
    const { message, userId = 'default', profile = {}, thread_id } = req.body;
    if (!message) return res.status(400).json({ error: 'Messaggio mancante' });

    // 1. THREAD HANDLING
    let threadId = thread_id;
    if (!threadId) {
      const thread = await openai.beta.threads.create();
      threadId = thread.id;
    }

    // 2. Aggiungi contesto al messaggio (profilo utente)
    let enrichedMessage = message;
    if (Object.keys(profile).length > 0) {
      const profiloText = Object.entries(profile)
        .map(([k, v]) => `- ${k}: ${v}`)
        .join("\n");
      enrichedMessage = `Profilo utente:\n${profiloText}\n\nDomanda:\n${message}`;
    }

    // 3. Invia messaggio
    await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: enrichedMessage
    });

    // 4. Avvia la run
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: assistantId
    });

    // 5. Attendi completamento o tool_call
    let status = run.status;
    let attempts = 0;
    const maxAttempts = 25;

    while (status !== 'completed' && attempts < maxAttempts) {
      await new Promise(r => setTimeout(r, 1000));
      const updated = await openai.beta.threads.runs.retrieve(threadId, run.id);
      status = updated.status;

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

    // 6. Recupera risposta finale
    const messages = await openai.beta.threads.messages.list(threadId);
    const last = messages.data.find(m => m.role === 'assistant' && m.run_id === run.id);

    return res.json({
      response: last?.content?.[0]?.text?.value || '✅ Risposta ricevuta.',
      thread_id: threadId
    });

  } catch (err) {
    console.error('Errore Assistant:', err.message);
    return res.status(500).json({ error: 'Errore nella chat AI' });
  }
});

module.exports = router;
