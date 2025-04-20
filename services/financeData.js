// services/financeData.js
const axios = require('axios');

const ALPHAVANTAGE_API_KEY = process.env.ALPHAVANTAGE_API_KEY;
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const YAHOO_FINANCE_PROXY = process.env.YAHOO_FINANCE_PROXY;

async function getFundamentals(symbol) {
  try {
    // --- 1. Alpha Vantage: overview base
    const avUrl = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${ALPHAVANTAGE_API_KEY}`;
    const avRes = await axios.get(avUrl);
    const overview = avRes.data;

    // --- 2. Finhub: dati analisti
    const finhubUrl = `https://finnhub.io/api/v1/stock/metric?symbol=${symbol}&metric=all&token=${FINNHUB_API_KEY}`;
    const finhubRes = await axios.get(finhubUrl);
    const metrics = finhubRes.data.metric || {};

    // --- 3. Yahoo Finance Proxy: descrizione, settore
    const yahooUrl = `${YAHOO_FINANCE_PROXY}/summary/${symbol}`;
    const yahooRes = await axios.get(yahooUrl);
    const yahooData = yahooRes.data || {};

    return {
      symbol,
      name: overview.Name || yahooData.shortName || '',
      description: yahooData.longBusinessSummary || '',
      sector: overview.Sector || yahooData.sector || '',
      marketCap: overview.MarketCapitalization || '',
      peRatio: metrics.peInclExtraTTM || '',
      eps: metrics.epsInclExtraItemsTTM || '',
      targetPrice: metrics["targetMeanPrice"] || '',
      dividendYield: overview.DividendYield || '',
      analystBuy: metrics["recommendationMean"] || '',
    };
  } catch (error) {
    console.error('Errore getFundamentals:', error.message);
    throw error;
  }
}

module.exports = { getFundamentals };
