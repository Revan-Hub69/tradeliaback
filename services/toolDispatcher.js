const { runTool } = require("./toolbox");
const { runScanner } = require("./scannerEngine");
const { fetchNews } = require("./newsFetcher");

async function resolveTools(toolCalls) {
  const results = [];

  for (const call of toolCalls) {
    const name = call.function.name;
    const args = JSON.parse(call.function.arguments || "{}");

    try {
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
        const result = strumenti.map(str => ({
          symbol: str,
          valutazione: "📈 possibile rialzo",
          commento: "sembra in zona interessante oggi"
        }));
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

    } catch (err) {
      results.push({
        tool_call_id: call.id,
        output: JSON.stringify({ error: "Errore nel tool: " + name })
      });
    }
  }

  return results;
}

module.exports = { resolveTools };
