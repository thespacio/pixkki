// tests/utils/performance.ts
// Helper para medir tiempos de carga de página en tests de rendimiento (Playwright),
// usando la Navigation Timing API del navegador.
import type { Page, TestInfo } from '@playwright/test';

export interface NavigationTiming {
  /** Tiempo hasta el primer byte de respuesta (ms). */
  ttfb: number;
  /** Tiempo hasta DOMContentLoaded, desde el inicio de la navegación (ms). */
  domContentLoaded: number;
  /** Tiempo hasta el evento load, desde el inicio de la navegación (ms). */
  load: number;
  /** Tiempo total de reloj de pared para page.goto() (incluye overhead de Playwright). */
  wallClock: number;
}

export async function measureNavigation(page: Page, url: string): Promise<NavigationTiming> {
  const start = Date.now();
  await page.goto(url, { waitUntil: 'load' });
  const wallClock = Date.now() - start;

  const timing = await page.evaluate(() => {
    const [nav] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    return {
      ttfb: nav.responseStart - nav.requestStart,
      domContentLoaded: nav.domContentLoadedEventEnd - nav.startTime,
      load: nav.loadEventEnd - nav.startTime,
    };
  });

  return { ...timing, wallClock };
}

/** Vuelca la medición en la columna "Notas" del reporte QA. */
export function annotateTiming(testInfo: TestInfo, timing: NavigationTiming): void {
  testInfo.annotations.push({
    type: 'notas',
    description: `load=${timing.load.toFixed(0)}ms · TTFB=${timing.ttfb.toFixed(0)}ms · DOMContentLoaded=${timing.domContentLoaded.toFixed(0)}ms`,
  });
}
