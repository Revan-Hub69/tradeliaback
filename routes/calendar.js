// routes/calendar.js
const express = require('express');
const router = express.Router();
const { fetchCalendarEvents } = require('../services/calendarFetcher');

router.get('/', async (req, res) => {
  try {
    const result = await fetchCalendarEvents();
    res.json(result);
  } catch (error) {
    console.error('Errore calendario:', error.message);
    res.status(500).json({ error: 'Errore durante il recupero del calendario eventi' });
  }
});

module.exports = router;
