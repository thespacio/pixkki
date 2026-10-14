// tests/scripts/run-k6-load.js
// Corre el script de carga de k6 y después regenera el reporte HTML combinado
// (qa-report/index.html) con lo último que haya de e2e/unit/load, igual que
// hacen los reporters de Playwright y Vitest.
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const {
  loadRows,
  writeQaReport,
  generatePdfReport,
} = require('../reporters/qa-report-shared');

const OUTPUT_DIR = path.resolve('qa-report');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'index.html');
const RESPONSABLE = 'Esthefania';

function resolveK6Binary() {
  const check = spawnSync('k6', ['version'], { stdio: 'ignore' });
  if (!check.error && check.status === 0) return 'k6';

  const windowsDefault = 'C:\\Program Files\\k6\\k6.exe';
  if (fs.existsSync(windowsDefault)) return windowsDefault;

  return null;
}

async function main() {
  const k6Bin = resolveK6Binary();

  if (!k6Bin) {
    console.log('\n⚠️  k6 no está instalado o no se encontró en el PATH.');
    console.log('   Instalalo desde https://k6.io/docs/get-started/installation/ y volvé a correr "npm run test:load".');
    console.log('   El resto del reporte QA se genera igual, sin la sección de pruebas de carga.');
    return 0;
  }

  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  console.log(`\n▶ ${k6Bin} run tests/load/pixkki-load-test.js (BASE_URL=${baseUrl})`);

  const result = spawnSync(k6Bin, ['run', 'tests/load/pixkki-load-test.js'], {
    stdio: 'inherit',
    env: { ...process.env, BASE_URL: baseUrl, QA_RESPONSABLE: RESPONSABLE },
  });

  const e2eRows = loadRows(path.join(OUTPUT_DIR, 'e2e-results.json'));
  const unitRows = loadRows(path.join(OUTPUT_DIR, 'unit-results.json'));
  const loadTestRows = loadRows(path.join(OUTPUT_DIR, 'load-results.json'));
  const allRows = [...unitRows, ...e2eRows, ...loadTestRows];

  writeQaReport(OUTPUT_FILE, allRows, { responsable: RESPONSABLE, runDate: new Date() });
  console.log(`\n📋 Reporte QA generado en: ${OUTPUT_FILE}`);

  try {
    const pdfPath = await generatePdfReport(OUTPUT_FILE, OUTPUT_FILE.replace(/\.html?$/i, '.pdf'));
    console.log(`📄 PDF generado en: ${pdfPath}`);
  } catch (error) {
    console.error('⚠️  No se pudo generar el PDF del reporte QA:', error);
  }

  return result.status ?? 1;
}

main().then((code) => process.exit(code));
