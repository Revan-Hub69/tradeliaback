// services/newsFetcher.js
const axios = require('axios');

const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
const GNEWS_API_KEY = process.env.GNEWS_API_KEY;

async function fetchNews(query) {
  const tavilyUrl = `https://api.tavily.com/search`;
  const gnewsUrl = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=it&token=${GNEWS_API_KEY}`;

  try {
    // 1. Richiesta a Tavily AI Search
    const tavilyRes = await axios.post(tavilyUrl, {
      api_key: TAVILY_API_KEY,
      query,
      search_depth: "advanced",
      include_answer: false,
      include_images: false,
      max_results: 5
    });

    const tavilyResults = tavilyRes.data.results.map((item) => ({
      source: 'Tavily',
      title: item.title,
      url: item.url,
      published: item.published_date,
    }));

    // 2. Richiesta a GNews
    const gnewsRes = await axios.get(gnewsUrl);
    const gnewsResults = gnewsRes.data.articles.map((item) => ({
      source: item.source.name || 'GNews',
      title: item.title,
      url: item.url,
      published: item.publishedAt,
    }));

    // 3. Combina e restituisce le notizie
    return [...tavilyResults, ...gnewsResults];
  } catch (error) {
    console.error('Errore durante fetchNews:', error.message);
    throw error;
  }
}

module.exports = { fetchNews };
