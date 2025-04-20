// services/toolbox.js
function runTool(type, data) {
  switch (type) {
    // === PRINCIPIANTE ===
    case 'position':
      return calcPositionSize(data);
    case 'risk':
      return calcRisk(data);
    case 'leverage':
      return calcLeverage(data);
    case 'breakeven':
      return calcBreakEven(data);

    // === INVESTITORE ===
    case 'dca':
      return calcDCA(data);
    case 'yield_simulation':
      return calcAnnualReturn(data);

    // === TRADER PRO ===
    case 'drawdown':
      return calcMaxDrawdown(data);
    case 'multi_asset_risk':
      return calcPortfolioRisk(data);

    // === CRYPTO EXPLORER ===
    case 'staking_apy':
      return calcStakingAPY(data);
    case 'token_vesting':
      return calcTokenVestingROI(data);

    default:
      return { error: 'Tipo di tool non riconosciuto' };
  }
}

//
// === PRINCIPIANTI ===
//

function calcPositionSize({ capitale, rischioPercentuale, stopLoss }) {
  if (!capitale || !rischioPercentuale || !stopLoss) return { error: 'Dati incompleti' };
  const rischio = capitale * (rischioPercentuale / 100);
  const posizione = rischio / stopLoss;
  return {
    tipo: 'position',
    posizione: Math.floor(posizione),
    rischioEuro: rischio.toFixed(2),
  };
}

function calcRisk({ quantità, stopLoss, capitale }) {
  if (!quantità || !stopLoss || !capitale) return { error: 'Dati incompleti' };
  const rischio = quantità * stopLoss;
  const rischioPercentuale = (rischio / capitale) * 100;
  return {
    tipo: 'risk',
    rischioEuro: rischio.toFixed(2),
    rischioPercentuale: rischioPercentuale.toFixed(2),
  };
}

function calcLeverage({ esposizione, capitale }) {
  if (!esposizione || !capitale) return { error: 'Dati incompleti' };
  const leva = esposizione / capitale;
  return { tipo: 'leverage', leva: leva.toFixed(2) };
}

function calcBreakEven({ prezzo1, quantità1, prezzo2, quantità2 }) {
  if (!prezzo1 || !quantità1 || !prezzo2 || !quantità2) return { error: 'Dati incompleti' };
  const totale = (prezzo1 * quantità1 + prezzo2 * quantità2);
  const totaleQty = quantità1 + quantità2;
  return {
    tipo: 'breakeven',
    breakeven: (totale / totaleQty).toFixed(2),
  };
}

//
// === INVESTITORI ===
//

function calcDCA({ capitaleTotale, numeroRate }) {
  if (!capitaleTotale || !numeroRate) return { error: 'Dati incompleti' };
  const rata = capitaleTotale / numeroRate;
  return {
    tipo: 'dca',
    rata: rata.toFixed(2),
    rateTotali: numeroRate,
  };
}

function calcAnnualReturn({ capitaleIniziale, capitaleFinale, anni }) {
  if (!capitaleIniziale || !capitaleFinale || !anni) return { error: 'Dati incompleti' };
  const rendimento = Math.pow(capitaleFinale / capitaleIniziale, 1 / anni) - 1;
  return {
    tipo: 'yield_simulation',
    rendimentoAnnuale: (rendimento * 100).toFixed(2) + '%',
  };
}

//
// === TRADER PRO ===
//

function calcMaxDrawdown({ equityCurve = [] }) {
  if (!Array.isArray(equityCurve) || equityCurve.length < 2) return { error: 'Serve una equity curve valida' };
  let maxPeak = equityCurve[0], maxDrawdown = 0;
  for (let i = 1; i < equityCurve.length; i++) {
    if (equityCurve[i] > maxPeak) maxPeak = equityCurve[i];
    const drawdown = (maxPeak - equityCurve[i]) / maxPeak;
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
  }
  return {
    tipo: 'drawdown',
    maxDrawdown: (maxDrawdown * 100).toFixed(2) + '%',
  };
}

function calcPortfolioRisk({ asset }) {
  if (!Array.isArray(asset) || asset.length === 0) return { error: 'Lista asset mancante' };
  const totale = asset.reduce((acc, a) => acc + (a.capitale * a.rischio), 0);
  const somma = asset.reduce((acc, a) => acc + a.capitale, 0);
  const rischioTotale = (totale / somma) * 100;
  return {
    tipo: 'multi_asset_risk',
    rischioTotale: rischioTotale.toFixed(2) + '%',
  };
}

//
// === CRYPTO EXPLORER ===
//

function calcStakingAPY({ percentualeAnnuo, periodoGiorni }) {
  if (!percentualeAnnuo || !periodoGiorni) return { error: 'Dati incompleti' };
  const apy = Math.pow(1 + percentualeAnnuo / 100, periodoGiorni / 365) - 1;
  return {
    tipo: 'staking_apy',
    rendimentoStimato: (apy * 100).toFixed(2) + '%',
  };
}

function calcTokenVestingROI({ tokenTotali, tokenSbloccati, prezzoMedio }) {
  if (!tokenTotali || !tokenSbloccati || !prezzoMedio) return { error: 'Dati incompleti' };
  const valoreSbloccato = tokenSbloccati * prezzoMedio;
  const valoreTotale = tokenTotali * prezzoMedio;
  return {
    tipo: 'token_vesting',
    valoreSbloccato: valoreSbloccato.toFixed(2),
    valoreTotale: valoreTotale.toFixed(2),
    percentualeSbloccata: ((tokenSbloccati / tokenTotali) * 100).toFixed(2) + '%',
  };
}

module.exports = { runTool };
