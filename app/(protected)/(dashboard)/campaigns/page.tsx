// app/(protected)/(dashboard)/campaigns/page.tsx

import { Database, ShieldAlert } from "lucide-react";
import { getCurrentUser } from "@/modules/auth";
import { createShelterService } from "@/modules/shelters";
import { CAMPAIGN_PERMISSIONS, getCampaignAccess } from "@/modules/campaigns/access";
import { CampaignsWorkspace } from "@/modules/campaigns/components/CampaignsWorkspace";
import type { ShelterOption } from "@/modules/campaigns/components/SuggestionPanel";
import { isMissingTableError } from "@/modules/campaigns/db-errors";
import { createCampaignService } from "@/modules/campaigns/factories/create-campaign-service";

export default async function CampaignsPage() {
  const user = await getCurrentUser();

  if (!user.permissions.includes(CAMPAIGN_PERMISSIONS.view)) {
    return (
      <div className="p-8 max-w-6xl mx-auto text-center py-24 text-muted-foreground">
        <ShieldAlert size={40} className="mx-auto mb-3 opacity-40" aria-hidden="true" />
        <p className="font-medium text-foreground">No tienes permiso para ver las campañas</p>
        <p className="text-sm mt-1">Pide acceso a un administrador si lo necesitas.</p>
      </div>
    );
  }

  const access = getCampaignAccess(user);
  const service = await createCampaignService();
  const shelterService = access.allShelters ? await createShelterService() : null;

  try {
    // Consultas independientes: se piden a la vez.
    const [campaigns, adoptable, shelters] = await Promise.all([
      service.list(access),
      service.listAdoptable(access),
      // Solo el superadmin elige albergue; el resto trabaja con el suyo.
      shelterService
        ? shelterService
            .findAll({ activo: true }, user)
            .then(({ data }): ShelterOption[] =>
              data.map((s) => ({ id: s.id, nombre: s.nombre_albergue })),
            )
        : Promise.resolve<ShelterOption[]>([]),
    ]);

    return (
      <div className="p-8 max-w-7xl mx-auto">
        <CampaignsWorkspace
          campaigns={campaigns}
          adoptable={adoptable}
          shelters={shelters}
          canCreate={user.permissions.includes(CAMPAIGN_PERMISSIONS.create)}
          canEdit={user.permissions.includes(CAMPAIGN_PERMISSIONS.edit)}
          canDelete={user.permissions.includes(CAMPAIGN_PERMISSIONS.delete)}
          aiConfigured={Boolean(process.env.GEMINI_API_KEY?.trim())}
        />
      </div>
    );
  } catch (error) {
    // Sin la migración no existen las tablas: se explica qué hacer en vez de mostrar un error técnico.
    if (isMissingTableError(error)) {
      return (
        <div className="p-8 max-w-2xl mx-auto py-24 text-center">
          <Database size={40} className="mx-auto mb-3 text-muted-foreground opacity-50" aria-hidden="true" />
          <h1 className="text-lg font-semibold text-foreground">Falta preparar la base de datos</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Las campañas necesitan tablas nuevas. Ejecuta el archivo{" "}
            <code>database/migrations/20261025_campanas.sql</code> en el SQL Editor de Supabase y
            recarga esta página.
          </p>
        </div>
      );
    }
    throw error;
  }
}
