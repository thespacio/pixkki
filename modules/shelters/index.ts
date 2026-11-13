// modules/shelters/index.ts
//
// Superficie pública del módulo de refugios. Los consumidores de `app/`
// importan desde aquí (`@/modules/shelters`) y no desde archivos internos.
// No exporta componentes de UI para no arrastrar `"use client"` ni
// dependencias de React al servidor.

export {
    createShelterService,
    createCreateShelterWithAdminUseCase,
} from "./factories";

export { ShelterService } from "./service";
export { ShelterRepository } from "./repository";
export { ShelterAuthorization } from "./authorization";

export * from "./types";
export * from "./errors";
