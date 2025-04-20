// services/fileUploader.js
const { OpenAI } = require('openai');
const fs = require('fs');
const path = require('path');
const os = require('os'); // ✅ aggiunto
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function uploadFileToOpenAI(file) {
  try {
    // ✅ salva il file in una directory temporanea di sistema
    const tempPath = path.join(os.tmpdir(), file.name);

    // Salvataggio temporaneo del file
    await file.mv(tempPath);

    // Caricamento su OpenAI
    const uploaded = await openai.files.create({
      file: fs.createReadStream(tempPath),
      purpose: 'assistants',
    });

    // Rimozione file temporaneo
    fs.unlinkSync(tempPath);

    return {
      file_id: uploaded.id,
      filename: uploaded.filename,
      status: uploaded.status,
    };
  } catch (error) {
    console.error('Errore durante upload su OpenAI:', error.message);
    throw error;
  }
}

module.exports = { uploadFileToOpenAI };
