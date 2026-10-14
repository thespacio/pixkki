// tests/scripts/run-all-and-report.js
// Corre las pruebas unitarias (Vitest), luego las e2e (Playwright) y por
// último las de carga (k6) en secuencia, sin depender de operadores de shell
// (que difieren entre cmd.exe/PowerShell/bash). Cada corrida deja su propio
// reporte parcial y regenera el HTML combinado en qa-report/index.html.
// Se sigue con el siguiente paso aunque el anterior falle, para que el
// reporte siempre se termine de generar. Requiere que el servidor de
// desarrollo (npm run dev) esté corriendo en BASE_URL (por defecto localhost:3000).
const { spawnSync } = require('node:child_process');

function run(command, args) {
  console.log(`\n▶ ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, { stdio: 'inherit', shell: true });
  return result.status ?? 1;
}

const unitStatus = run('npx', ['vitest', 'run', 'tests/unit', 'tests/integration']);
const e2eStatus = run('npx', ['playwright', 'test']);
const loadStatus = run('node', ['tests/scripts/run-k6-load.js']);

if (unitStatus !== 0 || e2eStatus !== 0 || loadStatus !== 0) {
  console.log('\n⚠️  Alguna suite tuvo fallos — revisá qa-report/index.html para el detalle.');
  process.exit(1);
}

console.log('\n✅ Todas las suites pasaron. Reporte en qa-report/index.html');
