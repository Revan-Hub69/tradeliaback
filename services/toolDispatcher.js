const { runTool } = require("./toolbox");
const { runScanner } = require("./scannerEngine");
const { fetchNews } = require("./newsFetcher");

async function resolveTools(toolCalls) {
  const results = [];

  for (const call of toolCalls) {
    const name = call.function.name;
    const args = JSON.parse(call.function.arguments || "{}");

    if (name === "calcolatori_ai") {
      const { tipo_calcolo, valori } = args;
      const result = runTool(tipo_calcolo, valori);
      results.push({
        tool_call_id: call.id,
        output: JSON.stringify(result)
      });
    }

    else if (name === "scanner_ai") {
      const { strumenti } = args;
      // Per ora: esegui lo scanner standard una volta
      const result = await runScanner("stocks"); // semplificato
      results.push({
        tool_call_id: call.id,
        output: JSON.stringify(result)
      });
    }

    else if (name === "news_lookup") {
      const { query } = args;
      const result = await fetchNews(query);
      results.push({
        tool_call_id: call.id,
        output: JSON.stringify(result)
      });
    }

    else {
      results.push({
        tool_call_id: call.id,
        output: JSON.stringify({ error: "Tool non riconosciuto: " + name })
      });
    }
  }

  return results;
}

module.exports = { resolveTools };
