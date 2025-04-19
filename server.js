const express = require('express');
const multer = require('multer');
const fetch = require('node-fetch');
const cors = require('cors');
require('dotenv').config();

const app = express();
const upload = multer();
app.use(cors());
app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ASSISTANT_ID = process.env.ASSISTANT_ID;

let threadId = null;

app.post('/ask', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Messaggio mancante' });

  try {
    if (!threadId) {
      const threadResp = await fetch('https://api.openai.com/v1/threads', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'OpenAI-Beta': 'assistants=v2',
          'Content-Type': 'application/json'
        }
      });
      const threadData = await threadResp.json();
      threadId = threadData.id;
    }

    const msgResp = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'OpenAI-Beta': 'assistants=v2',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ role: 'user', content: message })
    });

    await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'OpenAI-Beta': 'assistants=v2',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ assistant_id: ASSISTANT_ID })
    });

    setTimeout(async () => {
      const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'OpenAI-Beta': 'assistants=v2'
        }
      });
      const data = await response.json();
      const last = data.data?.[0]?.content?.[0]?.text?.value || 'Nessuna risposta trovata';
      res.json({ reply: last });
    }, 3000);

  } catch (error) {
    console.error('Errore:', error);
    res.status(500).json({ error: 'Errore interno' });
  }
});

app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nessun file ricevuto' });

  try {
    const fileResp = await fetch('https://api.openai.com/v1/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: (() => {
        const f = new FormData();
        f.append('purpose', 'assistants');
        f.append('file', new Blob([req.file.buffer]), req.file.originalname);
        return f;
      })()
    });

    const fileData = await fileResp.json();
    res.json({ status: 'File caricato', file_id: fileData.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore nel caricamento file' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server attivo su http://localhost:${PORT}`));
