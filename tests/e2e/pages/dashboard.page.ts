import { Page, Locator } from '@playwright/test';

// Secciones con página implementada — se valida que carguen sin 404.
export const DASHBOARD_SECTIONS = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Animales', href: '/animals' },
  { title: 'Adopciones', href: '/adoptions' },
  { title: 'Usuarios', href: '/staff' },
  { title: 'Albergues', href: '/shelters' },
  { title: 'Espacios', href: '/spaces' },
  { title: 'Seguridad', href: '/settings/security' },
];

// Secciones que ya aparecen en el menú pero todavía no tienen página (dan 404).
// TODO: mover a DASHBOARD_SECTIONS cuando se implementen sus rutas.
export const PENDING_DASHBOARD_SECTIONS = [
  { title: 'Reportes', href: '/reports' },
  { title: 'Expedientes', href: '/medical' },
  { title: 'Vacunas', href: '/vaccinations' },
  { title: 'Configuración', href: '/settings' },
];

export class DashboardPage {
  readonly page: Page;
  readonly sidebar: Locator;

  constructor(page: Page) {
    this.page = page;
    this.sidebar = page.locator('aside nav');
  }

  sectionLink(href: string): Locator {
    return this.sidebar.locator(`a[href="${href}"]`);
  }
}
