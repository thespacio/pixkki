// tests/load/pixkki-load-test.js
// Prueba de carga con k6: simula múltiples usuarios concurrentes navegando
// la landing page y la página de login, y valida que la latencia y la tasa
// de error se mantengan dentro de umbrales aceptables bajo esa carga.
//
// Correr con: npm run test:load
// (o directamente: k6 run tests/load/pixkki-load-test.js)
import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

const P95_THRESHOLD_MS = 2000;
const ERROR_RATE_THRESHOLD = 0.01;

export const options = {
  scenarios: {
    landing_load: {
      executor: 'ramping-vus',
      exec: 'landingPage',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 10 },
        { duration: '20s', target: 10 },
        { duration: '5s', target: 0 },
      ],
    },
    login_load: {
      executor: 'ramping-vus',
      exec: 'loginPage',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 10 },
        { duration: '20s', target: 10 },
        { duration: '5s', target: 0 },
      ],
    },
    // Matriz de pruebas — fila 10: "Prueba de estrés (pico de tráfico)".
    // A diferencia de los escenarios de arriba (rampa gradual), este sube
    // de golpe a un pico alto y corto para verificar que el sistema se
    // recupera sin errores tras el pico, no solo que aguanta carga sostenida.
    landing_spike: {
      executor: 'ramping-vus',
      exec: 'landingPage',
      startVUs: 0,
      startTime: '35s', // arranca después de que terminan los escenarios de arriba
      stages: [
        { duration: '5s', target: 40 },
        { duration: '10s', target: 40 },
        { duration: '5s', target: 0 },
      ],
    },
  },
  thresholds: {
    'http_req_duration{scenario:landing_load}': [`p(95)<${P95_THRESHOLD_MS}`],
    'http_req_failed{scenario:landing_load}': [`rate<${ERROR_RATE_THRESHOLD}`],
    'http_reqs{scenario:landing_load}': ['count>=0'],
    'http_req_duration{scenario:login_load}': [`p(95)<${P95_THRESHOLD_MS}`],
    'http_req_failed{scenario:login_load}': [`rate<${ERROR_RATE_THRESHOLD}`],
    'http_reqs{scenario:login_load}': ['count>=0'],
    'http_req_failed{scenario:landing_spike}': ['rate<0.05'],
    'http_reqs{scenario:landing_spike}': ['count>=0'],
  },
};

export function landingPage() {
  const res = http.get(`${BASE_URL}/`);
  check(res, { 'landing status 200': (r) => r.status === 200 });
  sleep(1);
}

export function loginPage() {
  const res = http.get(`${BASE_URL}/login`);
  check(res, { 'login status 200': (r) => r.status === 200 });
  sleep(1);
}

export function handleSummary(data) {
  const responsable = __ENV.QA_RESPONSABLE || 'Esthefania';
  const fecha = new Date().toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' });

  const scenarios = [
    {
      id: 'TC-L01',
      caso: 'Landing page bajo carga concurrente',
      criterio: `Con hasta 10 usuarios virtuales concurrentes navegando la landing (/), el p95 de latencia se mantiene bajo ${P95_THRESHOLD_MS} ms y la tasa de error bajo ${ERROR_RATE_THRESHOLD * 100}%.`,
      durationKey: 'http_req_duration{scenario:landing_load}',
      failedKey: 'http_req_failed{scenario:landing_load}',
      reqsKey: 'http_reqs{scenario:landing_load}',
    },
    {
      id: 'TC-L02',
      caso: 'Login page bajo carga concurrente',
      criterio: `Con hasta 10 usuarios virtuales concurrentes navegando /login, el p95 de latencia se mantiene bajo ${P95_THRESHOLD_MS} ms y la tasa de error bajo ${ERROR_RATE_THRESHOLD * 100}%.`,
      durationKey: 'http_req_duration{scenario:login_load}',
      failedKey: 'http_req_failed{scenario:login_load}',
      reqsKey: 'http_reqs{scenario:login_load}',
    },
    {
      id: 'TC-L03',
      caso: 'Prueba de estrés — pico de tráfico en la landing',
      criterio: 'Ante un pico repentino de hasta 40 usuarios virtuales concurrentes, el sistema se recupera sin superar 5% de tasa de error (no exige la misma latencia que bajo carga sostenida).',
      durationKey: 'http_req_duration{scenario:landing_spike}',
      failedKey: 'http_req_failed{scenario:landing_spike}',
      reqsKey: 'http_reqs{scenario:landing_spike}',
      skipDurationThreshold: true,
    },
  ];

  const rows = scenarios.map(({ id, caso, criterio, durationKey, failedKey, reqsKey, skipDurationThreshold }) => {
    const durationMetric = data.metrics[durationKey];
    const failedMetric = data.metrics[failedKey];
    const reqsMetric = data.metrics[reqsKey];

    const p95 = durationMetric?.values?.['p(95)'];
    const avg = durationMetric?.values?.avg;
    const errorRate = failedMetric?.values?.rate ?? 0;
    const requestCount = reqsMetric?.values?.count ?? 0;

    const durationOk = skipDurationThreshold || !durationMetric?.thresholds
      ? true
      : Object.values(durationMetric.thresholds).every((t) => t.ok);
    const failedOk = failedMetric?.thresholds
      ? Object.values(failedMetric.thresholds).every((t) => t.ok)
      : true;

    const resultado = durationOk && failedOk ? 'Exitoso' : 'Fallido';

    const notas = `p95=${p95 !== undefined ? p95.toFixed(0) : '—'}ms · avg=${avg !== undefined ? avg.toFixed(0) : '—'}ms · error_rate=${(errorRate * 100).toFixed(2)}% · requests=${requestCount}`;

    return {
      id,
      categoria: 'Rendimiento',
      caso,
      criterio,
      prioridad: 'Alta',
      resultado,
      evidenciaHtml: '—',
      notas,
      responsable,
      fecha,
      duracion: `${(data.state.testRunDurationMs / 1000).toFixed(2)} s`,
      origen: 'load',
    };
  });

  return {
    'qa-report/load-results.json': JSON.stringify(rows, null, 2),
  };
}
