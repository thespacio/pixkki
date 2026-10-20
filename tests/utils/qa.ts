// tests/utils/qa.ts
// Helper para anotar tests de Vitest con los metadatos de QA
// (Id, Categoría, Criterio de aceptación, Prioridad, Notas) que después
// recoge tests/reporters/qa-vitest-reporter.ts para el reporte HTML consolidado.
import type { TestContext } from 'vitest';

export type QaCategoria = 'Funcional' | 'Rendimiento' | 'Unitaria' | 'Seguridad';
export type QaPrioridad = 'Alta' | 'Media' | 'Baja';

export type QaMeta = {
  id: string;
  categoria: QaCategoria;
  criterio: string;
  prioridad: QaPrioridad;
  notas?: string;
};

/**
 * Uso: it('mi caso', async (ctx) => {
 *   await qaAnnotate(ctx, { id: 'TC-U01', categoria: 'Unitaria', criterio: '...', prioridad: 'Alta' });
 *   ... resto del test ...
 * });
 */
export async function qaAnnotate(ctx: TestContext, meta: QaMeta): Promise<void> {
  await ctx.annotate(meta.id, 'id');
  await ctx.annotate(meta.categoria, 'categoria');
  await ctx.annotate(meta.criterio, 'criterio');
  await ctx.annotate(meta.prioridad, 'prioridad');
  if (meta.notas) {
    await ctx.annotate(meta.notas, 'notas');
  }
}
