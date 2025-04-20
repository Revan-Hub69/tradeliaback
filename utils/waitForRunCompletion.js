const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function waitForRunCompletion(threadId, runId, timeout = 20000, interval = 1000) {
  const start = Date.now();

  while (Date.now() - start < timeout) {
    const run = await openai.beta.threads.runs.retrieve(threadId, runId);
    if (run.status === 'completed') return run;
    if (['failed', 'cancelled', 'expired'].includes(run.status)) throw new Error(`Run ${run.status}`);
    await new Promise((r) => setTimeout(r, interval));
  }

  throw new Error('Timeout: run non completata in tempo');
}

module.exports = waitForRunCompletion;
