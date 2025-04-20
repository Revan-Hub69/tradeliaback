// services/fileUploader.js
const { OpenAI } = require('openai');
const fs = require('fs');
const path = require('path');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function uploadFileToOpenAI(file) {
  try {
    const tempPath = path.join(__dirname, '..', 'temp', file.name);

    // Salviamo temporaneamente il file localmente
    await file.mv(tempPath);

    // Carichiamo su OpenAI
    const uploaded = await openai.files.create({
      file: fs.createReadStream(tempPath),
      purpose: 'assistants',
    });

    // Pulizia file temporaneo
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
