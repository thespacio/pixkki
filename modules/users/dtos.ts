import type { CreateStaffInput } from "./schemas";

export type CreateStaffDTO = CreateStaffInput & {
    /** Inyectado por la Action desde el contexto autenticado, no por el cliente. */
    shelterId: number;
};