const { OpenAI } = require('openai');
const waitForRunCompletion = require('../utils/waitForRunCompletion');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ASSISTANT_ID = process.env.ASSISTANT_ID;

async function sendMessageToAssistant({ message, thread_id, file_ids = [] }) {
  try {
    let thread;

    if (thread_id) {
      thread = { id: thread_id };
    } else {
      thread = await openai.beta.threads.create();
    }

    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: message,
      file_ids,
    });

    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: ASSISTANT_ID,
    });

    const completedRun = await waitForRunCompletion(thread.id, run.id);

    const messages = await openai.beta.threads.messages.list(thread.id);
    const lastMessage = messages.data.find(
      (msg) => msg.role === 'assistant' && msg.run_id === run.id
    );

    const aiText = lastMessage?.content?.[0]?.text?.value || '[Risposta vuota]';

    return {
      response: aiText,
      thread_id: thread.id,
    };
  } catch (err) {
    console.error('Errore OpenAI:', err.message);
    throw new Error('Errore nella comunicazione con OpenAI');
  }
}

module.exports = { sendMessageToAssistant };
