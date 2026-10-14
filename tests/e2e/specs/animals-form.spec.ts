import { test, expect, qaMeta } from '../fixtures';

test.describe('Formulario de animales', () => {

  // Matriz de pruebas — fila 5: "Envío y guardado de formularios".
  // Antes de la corrección de BUG-10/BUG-11 (ver registro de defectos), este
  // modal ni siquiera se abría (crash con "estados.map is not a function").
  // Corregido eso, el formulario sí se abre, pero el desplegable
  // "Espacio / Lugar" sigue sin cargar opciones nunca (BUG-08): el front-end
  // no llama a ningún endpoint para poblarlo. Sigue bloqueado.
  test('El desplegable "Espacio / Lugar" nunca carga opciones (formulario incompletable)', qaMeta({
    id: 'TC-F01',
    categoria: 'Funcional',
    criterio: 'Los datos ingresados en el formulario de alta de animal se guardan correctamente en la base de datos.',
    prioridad: 'Alta',
    notas: 'Bug bloqueante: ver BUG-08 en el registro de defectos. (BUG-10/BUG-11, que impedían incluso abrir el modal, ya se corrigieron en esta sesión).',
  }), async ({ page, authenticatedPage }) => {
    await page.goto('/animals');
    await page.getByRole('button', { name: /Registrar animal/i }).click();
    await expect(page.getByRole('heading', { name: 'Registrar animal' })).toBeVisible();

    const selects = page.locator('form select');

    // "Estado" (ya corregido): debe tener opciones reales además del placeholder
    // (se espera a que resuelva el fetch a /api/catalogs/animal-states).
    await expect(async () => {
      const count = await selects.nth(2).locator('option').count();
      expect(count).toBeGreaterThan(1);
    }).toPass({ timeout: 5000 });

    // "Espacio / Lugar" (BUG-08, sigue roto): solo el placeholder, nunca opciones reales.
    const espacioOptions = await selects.last().locator('option').allTextContents();
    expect(espacioOptions, 'Espacio debería tener opciones reales para elegir').toEqual(['Seleccionar...']);
  });

  // Matriz de pruebas — fila 23: "Validación de campos obligatorios".
  test('El formulario de animales bloquea el envío si falta un campo obligatorio', qaMeta({
    id: 'TC-F02',
    categoria: 'Funcional',
    criterio: 'El formulario no permite enviar datos incompletos y mantiene al usuario en el formulario hasta completar los campos obligatorios.',
    prioridad: 'Alta',
  }), async ({ page, authenticatedPage }) => {
    await page.goto('/animals');
    await page.getByRole('button', { name: /Registrar animal/i }).click();
    await expect(page.getByRole('heading', { name: 'Registrar animal' })).toBeVisible();

    // Dejamos "Orígen" (procedencia, obligatorio) vacío a propósito y enviamos.
    await page.locator('form button[type="submit"]').click();

    // La validación nativa del navegador debe bloquear el envío: el modal
    // sigue abierto y el campo obligatorio vacío queda marcado como inválido.
    await expect(page.getByRole('heading', { name: 'Registrar animal' })).toBeVisible();
    const procedenciaInput = page.locator('input[placeholder="Ej. Avenida, aguas sucias,"]');
    await expect(procedenciaInput).toHaveJSProperty('validity.valid', false);
  });

});
