import path from 'node:path';
import {
  stripAnsi,
  formatDuration,
  loadRows,
  saveRows,
  writeQaReport,
  generatePdfReport,
} from './qa-report-shared';

type QaRow = {
  id: string;
  categoria: string;
  caso: string;
  criterio: string;
  prioridad: string;
  resultado: 'Exitoso' | 'Fallido' | 'Omitido' | 'Interrumpido' | 'Desconocido';
  evidenciaHtml: string;
  notas: string;
  responsable: string;
  fecha: string;
  duracion: string;
  origen: 'e2e' | 'unit' | 'load';
};

interface QaVitestReporterOptions {
  outputFile?: string;
  responsable?: string;
}

// Tipos mínimos de la API de reporters de Vitest 4 que usamos acá
// (evita depender de los tipos internos de vitest/node en tiempo de carga del reporter).
interface VitestTestAnnotation {
  type: string;
  message: string;
}
interface VitestTestResult {
  state: 'passed' | 'failed' | 'skipped' | 'pending';
  errors?: ReadonlyArray<{ message?: string }>;
}
interface VitestTestCase {
  fullName: string;
  annotations(): ReadonlyArray<VitestTestAnnotation>;
  result(): VitestTestResult;
  diagnostic(): { duration: number } | undefined;
}

function getAnnotation(testCase: VitestTestCase, type: string): string | undefined {
  return testCase.annotations().find(a => a.type === type)?.message;
}

function statusLabel(state: VitestTestResult['state']): QaRow['resultado'] {
  switch (state) {
    case 'passed': return 'Exitoso';
    case 'failed': return 'Fallido';
    case 'skipped': return 'Omitido';
    default: return 'Desconocido';
  }
}

class QaVitestReporter {
  private rows: QaRow[] = [];
  private readonly outputDir: string;
  private readonly outputFile: string;
  private readonly resultsFile: string;
  private readonly e2eResultsFile: string;
  private readonly loadResultsFile: string;
  private readonly responsable: string;
  private readonly runDate = new Date();

  constructor(options: QaVitestReporterOptions = {}) {
    this.outputFile = options.outputFile ?? 'qa-report/index.html';
    this.outputDir = path.dirname(path.resolve(this.outputFile));
    this.resultsFile = path.join(this.outputDir, 'unit-results.json');
    this.e2eResultsFile = path.join(this.outputDir, 'e2e-results.json');
    this.loadResultsFile = path.join(this.outputDir, 'load-results.json');
    this.responsable = options.responsable ?? 'Esthefania';
  }

  onTestCaseResult(testCase: VitestTestCase): void {
    const result = testCase.result();

    const id = getAnnotation(testCase, 'id') ?? testCase.fullName;
    const categoria = getAnnotation(testCase, 'categoria') ?? 'Unitaria';
    const criterio = getAnnotation(testCase, 'criterio') ?? '—';
    const prioridad = getAnnotation(testCase, 'prioridad') ?? 'Media';
    const notasAnno = getAnnotation(testCase, 'notas');

    const resultado = statusLabel(result.state);

    const errores = (result.errors ?? [])
      .map(e => e.message)
      .filter(Boolean)
      .map(m => stripAnsi(m!.split('\n')[0]))
      .join(' | ');

    const notas = [notasAnno, resultado === 'Fallido' ? errores : undefined]
      .filter(Boolean)
      .join(' — ') || '—';

    this.rows.push({
      id,
      categoria,
      caso: testCase.fullName,
      criterio,
      prioridad,
      resultado,
      evidenciaHtml: '—',
      notas,
      responsable: this.responsable,
      fecha: this.runDate.toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' }),
      duracion: formatDuration(testCase.diagnostic()?.duration ?? 0),
      origen: 'unit',
    });
  }

  async onTestRunEnd(): Promise<void> {
    saveRows(this.resultsFile, this.rows);

    const e2eRows = loadRows(this.e2eResultsFile);
    const loadTestRows = loadRows(this.loadResultsFile);
    const allRows = [...this.rows, ...e2eRows, ...loadTestRows];

    const htmlPath = writeQaReport(this.outputFile, allRows, { responsable: this.responsable, runDate: this.runDate });
    console.log(`\n📋 Reporte QA generado en: ${htmlPath}`);

    try {
      const pdfPath = await generatePdfReport(this.outputFile, this.outputFile.replace(/\.html?$/i, '.pdf'));
      console.log(`📄 PDF generado en: ${pdfPath}`);
    } catch (error) {
      console.error('⚠️  No se pudo generar el PDF del reporte QA:', error);
    }
  }
}

export default QaVitestReporter;
