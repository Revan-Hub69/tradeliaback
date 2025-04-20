// services/scannerEngine.js
const axios = require('axios');

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const POLYGON_API_KEY = process.env.POLYGON_API_KEY;
const TWELVEDATA_API_KEY = process.env.TWELVEDATA_API_KEY;
const YAHOO_FINANCE_PROXY = process.env.YAHOO_FINANCE_PROXY;

async function runScanner(asset) {
  if (asset === 'crypto') return scanCrypto();
  if (asset === 'forex') return scanForex();
  return scanStocks(); // default
}

// --- CRYPTO SCANNER ---
async function scanCrypto() {
  const url = 'https://api.coingecko.com/api/v3/search/trending';

  const res = await axios.get(url);
  const coins = res.data.coins.map((c) => ({
    type: 'crypto',
    symbol: c.item.symbol,
    name: c.item.name,
    rank: c.item.market_cap_rank,
    price_btc: c.item.price_btc,
    url: `https://www.coingecko.com/en/coins/${c.item.id}`,
  }));

  return coins.slice(0, 5);
}

// --- FOREX SCANNER ---
async function scanForex() {
  const url = `https://api.twelvedata.com/forex_pairs?apikey=${TWELVEDATA_API_KEY}`;
  const res = await axios.get(url);
  const pairs = res.data.data?.slice(0, 5) || [];

  return pairs.map((p) => ({
    type: 'forex',
    symbol: `${p.symbol}`,
    currency_base: p.currency_base,
    currency_quote: p.currency_quote,
  }));
}

// --- STOCKS SCANNER ---
async function scanStocks() {
  const url = `${YAHOO_FINANCE_PROXY}/trending/stocks`;
  const res = await axios.get(url);
  const symbols = res.data?.quotes?.slice(0, 5) || [];

  return symbols.map((s) => ({
    type: 'stock',
    symbol: s.symbol,
    name: s.shortName,
    price: s.regularMarketPrice,
  }));
}

module.exports = { runScanner };
