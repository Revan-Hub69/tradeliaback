// services/calendarFetcher.js
const axios = require('axios');

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const COINMARKETCAL_API_KEY = process.env.COINMARKETCAL_API_KEY;

async function fetchCalendarEvents() {
  const macro = await fetchMacroEvents();
  const crypto = await fetchCryptoEvents();

  return {
    macro,
    crypto,
  };
}

// --- EVENTI MACROECONOMICI (Finhub) ---
async function fetchMacroEvents() {
  const today = new Date().toISOString().split('T')[0];
  const url = `https://finnhub.io/api/v1/calendar/economic?from=${today}&to=${today}&token=${FINNHUB_API_KEY}`;
  const res = await axios.get(url);

  return res.data?.economicCalendar || [];
}

// --- EVENTI CRYPTO (CoinMarketCal) ---
async function fetchCryptoEvents() {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const url = `https://developers.coinmarketcal.com/v1/events?start_date=${today}&end_date=${tomorrow}&sortBy=hot_events`;

  const res = await axios.get(url, {
    headers: {
      'x-api-key': COINMARKETCAL_API_KEY,
      Accept: 'application/json',
    },
  });

  return res.data?.body?.map((event) => ({
    coin: event.coins?.[0]?.name || '',
    event: event.title,
    date: event.date_event,
    description: event.description,
    proof: event.proof,
  })) || [];
}

module.exports = { fetchCalendarEvents };
