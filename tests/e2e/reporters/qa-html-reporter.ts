import type {
  Reporter,
  TestCase,
  TestResult,
  FullResult,
} from '@playwright/test/reporter';
import path from 'node:path';
import {
  escapeHtml,
  stripAnsi,
  formatDuration,
  loadRows,
  saveRows,
  writeQaReport,
  generatePdfReport,
} from '../../reporters/qa-report-shared';

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

interface QaHtmlReporterOptions {
  outputFile?: string;
  responsable?: string;
}

function getAnnotation(test: TestCase, type: string): string | undefined {
  return test.annotations.find(a => a.type === type)?.description;
}

function statusLabel(status: TestResult['status']): QaRow['resultado'] {
  switch (status) {
    case 'passed': return 'Exitoso';
    case 'failed':
    case 'timedOut': return 'Fallido';
    case 'skipped': return 'Omitido';
    case 'interrupted': return 'Interrumpido';
    default: return 'Desconocido';
  }
}

class QaHtmlReporter implements Reporter {
  private rows: QaRow[] = [];
  private readonly outputDir: string;
  private readonly outputFile: string;
  private readonly resultsFile: string;
  private readonly unitResultsFile: string;
  private readonly loadResultsFile: string;
  private readonly responsable: string;
  private readonly runDate = new Date();

  constructor(options: QaHtmlReporterOptions = {}) {
    this.outputFile = options.outputFile ?? 'qa-report/index.html';
    this.outputDir = path.dirname(path.resolve(this.outputFile));
    this.resultsFile = path.join(this.outputDir, 'e2e-results.json');
    this.unitResultsFile = path.join(this.outputDir, 'unit-results.json');
    this.loadResultsFile = path.join(this.outputDir, 'load-results.json');
    this.responsable = options.responsable ?? 'Esthefania';
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    const id = getAnnotation(test, 'id') ?? test.id.slice(0, 8);
    const categoria = getAnnotation(test, 'categoria') ?? 'Funcional';
    const criterio = getAnnotation(test, 'criterio') ?? '—';
    const prioridad = getAnnotation(test, 'prioridad') ?? 'Media';
    const notasAnno = getAnnotation(test, 'notas');

    const resultado = statusLabel(result.status);

    const errores = result.errors
      .map(e => e.message)
      .filter(Boolean)
      .map(m => stripAnsi(m!.split('\n')[0]))
      .join(' | ');

    const notas = [notasAnno, resultado === 'Fallido' ? errores : undefined]
      .filter(Boolean)
      .join(' — ') || '—';

    const evidenciaLinks = result.attachments
      .filter(a => !!a.path)
      .map(a => {
        const rel = path.relative(this.outputDir, a.path!).split(path.sep).join('/');
        return `<a href="${escapeHtml(rel)}" target="_blank" rel="noopener">${escapeHtml(a.name)}</a>`;
      });

    const caso = test.titlePath().slice(3).join(' › ') || test.title;

    this.rows.push({
      id,
      categoria,
      caso,
      criterio,
      prioridad,
      resultado,
      evidenciaHtml: evidenciaLinks.join('<br>') || '—',
      notas,
      responsable: this.responsable,
      fecha: this.runDate.toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' }),
      duracion: formatDuration(result.duration),
      origen: 'e2e',
    });
  }

  async onEnd(_result: FullResult): Promise<void> {
    saveRows(this.resultsFile, this.rows);

    const unitRows = loadRows(this.unitResultsFile);
    const loadRowsData = loadRows(this.loadResultsFile);
    const allRows = [...unitRows, ...loadRowsData, ...this.rows];

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

export default QaHtmlReporter;
