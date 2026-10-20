// tests/reporters/qa-report-shared.js
// Lógica compartida entre los reporters de Playwright (e2e), Vitest (unit)
// y el runner de k6 (load), para que los tres alimenten el mismo reporte HTML
// consolidado. Es CommonJS puro (no TypeScript) a propósito: así lo puede
// usar tanto un reporter de TS (vía import, con allowJs) como un script Node
// plano invocado después de correr k6 (que no tiene su propio transform de TS).
const fs = require('node:fs');
const path = require('node:path');

const PRIORIDAD_ORDEN = { Alta: 0, Media: 1, Baja: 2 };

// eslint-disable-next-line no-control-regex
const ANSI_REGEX = /\x1b\[[0-9;]*m/g;

function stripAnsi(value) {
  return value.replace(ANSI_REGEX, '');
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDuration(ms) {
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

function loadRows(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch {
    return [];
  }
}

function saveRows(file, rows) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(rows, null, 2), 'utf-8');
}

function statusClass(resultado) {
  return resultado === 'Exitoso' ? 'ok' : resultado === 'Fallido' ? 'fail' : 'skip';
}

function buildHtml(rows, totals, opts) {
  const rowsHtml = rows.map(r => `
      <tr class="row-${statusClass(r.resultado)}">
        <td>${escapeHtml(r.id)}</td>
        <td><span class="badge badge-${r.categoria.toLowerCase()}">${escapeHtml(r.categoria)}</span></td>
        <td>${escapeHtml(r.caso)}</td>
        <td>${escapeHtml(r.criterio)}</td>
        <td><span class="badge badge-prio-${r.prioridad.toLowerCase()}">${escapeHtml(r.prioridad)}</span></td>
        <td><span class="status status-${statusClass(r.resultado)}">${escapeHtml(r.resultado)}</span></td>
        <td>${r.evidenciaHtml}</td>
        <td>${escapeHtml(r.notas)}</td>
        <td>${escapeHtml(r.responsable)}</td>
        <td>${escapeHtml(r.fecha)}</td>
        <td>${escapeHtml(r.duracion)}</td>
      </tr>`).join('\n');

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>Reporte de pruebas QA — Pixkki</title>
<style>
  :root {
    --ok: #1a7f37; --ok-bg: #dafbe1;
    --fail: #b3261e; --fail-bg: #ffdad6;
    --skip: #6b6250; --skip-bg: #efeade;
    --border: #d9d4c8;
    --bg: #ffffff; --fg: #2e2e2e; --muted: #6b6b6b;
  }
  @media (prefers-color-scheme: dark) {
    :root { --bg: #1c1c1c; --fg: #eee; --muted: #aaa; --border: #3a3a3a; }
  }
  * { box-sizing: border-box; }
  body { font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; background: var(--bg); color: var(--fg); margin: 0; padding: 2rem; }
  h1 { font-size: 1.5rem; margin-bottom: .25rem; }
  .subtitle { color: var(--muted); margin-bottom: 1.5rem; font-size: .9rem; }
  .summary { display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 2rem; }
  .card { border: 1px solid var(--border); border-radius: 12px; padding: 1rem 1.5rem; min-width: 140px; }
  .card .value { font-size: 1.8rem; font-weight: 700; }
  .card .label { color: var(--muted); font-size: .8rem; text-transform: uppercase; letter-spacing: .04em; }
  .card.ok .value { color: var(--ok); }
  .card.fail .value { color: var(--fail); }
  .card.skip .value { color: var(--skip); }
  table { border-collapse: collapse; width: 100%; font-size: .85rem; }
  th, td { border: 1px solid var(--border); padding: .5rem .6rem; text-align: left; vertical-align: top; }
  th { background: rgba(128,128,128,.08); position: sticky; top: 0; }
  tr.row-fail { background: rgba(179,38,30,.06); }
  .status { padding: .15rem .5rem; border-radius: 999px; font-weight: 600; font-size: .75rem; }
  .status-ok { color: var(--ok); background: var(--ok-bg); }
  .status-fail { color: var(--fail); background: var(--fail-bg); }
  .status-skip { color: var(--skip); background: var(--skip-bg); }
  .badge { padding: .1rem .5rem; border-radius: 6px; font-size: .75rem; background: rgba(128,128,128,.15); }
  .table-wrap { overflow-x: auto; border: 1px solid var(--border); border-radius: 12px; }
  footer { margin-top: 1.5rem; color: var(--muted); font-size: .8rem; }
</style>
</head>
<body>
  <h1>Reporte de pruebas — Pixkki</h1>
  <p class="subtitle">Generado el ${escapeHtml(opts.runDate.toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'medium' }))} · Responsable: ${escapeHtml(opts.responsable)}</p>

  <div class="summary">
    <div class="card"><div class="value">${totals.total}</div><div class="label">Total casos</div></div>
    <div class="card ok"><div class="value">${totals.exitosos}</div><div class="label">Exitosos</div></div>
    <div class="card fail"><div class="value">${totals.fallidos}</div><div class="label">Fallidos</div></div>
    <div class="card skip"><div class="value">${totals.omitidos}</div><div class="label">Omitidos</div></div>
  </div>

  <div class="table-wrap">
  <table>
    <thead>
      <tr>
        <th>Id</th>
        <th>Categoría</th>
        <th>Caso de prueba</th>
        <th>Criterio de aceptación</th>
        <th>Prioridad</th>
        <th>Resultado</th>
        <th>Evidencia</th>
        <th>Notas</th>
        <th>Responsable</th>
        <th>Fecha</th>
        <th>Tiempo de ejecución</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>
  </div>

  <footer>Reporte generado automáticamente a partir de los resultados de Playwright (e2e), Vitest (unitarias) y k6 (carga).</footer>
</body>
</html>`;
}

function writeQaReport(outputFile, rows, opts) {
  const sorted = [...rows].sort((a, b) => {
    const pa = PRIORIDAD_ORDEN[a.prioridad] ?? 99;
    const pb = PRIORIDAD_ORDEN[b.prioridad] ?? 99;
    if (pa !== pb) return pa - pb;
    return a.id.localeCompare(b.id, undefined, { numeric: true });
  });

  const exitosos = rows.filter(r => r.resultado === 'Exitoso').length;
  const fallidos = rows.filter(r => r.resultado === 'Fallido').length;
  const omitidos = rows.filter(r => r.resultado === 'Omitido').length;

  const html = buildHtml(sorted, { exitosos, fallidos, omitidos, total: rows.length }, opts);

  const outPath = path.resolve(outputFile);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html, 'utf-8');

  return outPath;
}

/**
 * Renderiza el HTML del reporte a PDF usando Chromium headless de Playwright
 * (ya es una dependencia del proyecto, no requiere instalar nada nuevo).
 * `require` de 'playwright' queda adentro de la función para no cargar un
 * navegador cada vez que solo se necesita escribir el HTML/JSON.
 */
async function generatePdfReport(htmlFile, pdfFile) {
  const { chromium } = require('@playwright/test');

  const htmlPath = path.resolve(htmlFile);
  const pdfPath = path.resolve(pdfFile);
  fs.mkdirSync(path.dirname(pdfPath), { recursive: true });

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto(`file:///${htmlPath.replace(/\\/g, '/')}`, { waitUntil: 'load' });
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: { top: '12mm', bottom: '12mm', left: '8mm', right: '8mm' },
    });
  } finally {
    await browser.close();
  }

  return pdfPath;
}

module.exports = {
  stripAnsi,
  escapeHtml,
  formatDuration,
  loadRows,
  saveRows,
  writeQaReport,
  generatePdfReport,
};
