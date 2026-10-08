// modules/shelters/types.ts

import { z } from 'zod';
import {
    ShelterSchema,
    CreateShelterSchema,
    UpdateShelterSchema,
    ShelterFiltersSchema, ShelterFieldsSchema
} from './schemas';
import {UseFormReturn} from "react-hook-form";
import {CreateShelterWithAdminSchema} from "@/modules/shelters/schemas";

// ===== ENTIDADES DEL DOMINIO =====
// Usamos z.infer para mantener consistencia con los schemas
export type Shelter = z.infer<typeof ShelterSchema>;
/**
 * Valores compartidos del formulario de refugio (crear / editar).
 * `nombre_admin` solo aplica en modo creación.
 */
export type ShelterFormValues = z.input<typeof ShelterFieldsSchema> & {
    nombre_admin?: string;
};
export type CreateShelterInput = z.infer<typeof CreateShelterSchema>;
export type UpdateShelterInput = z.infer<typeof UpdateShelterSchema>;
export type ShelterFilters = z.infer<typeof ShelterFiltersSchema>;

/**
 * Input de creación de refugio con administrador.
 * Derivado de Zod (fuente única de verdad) — F-SHELTER-02.
 */
export type CreateShelterWithAdminInput = z.infer<typeof CreateShelterWithAdminSchema>;
export interface CreateShelterWithAdminOutput {
    shelter: {
        id: number;
        nombre: string;
    };
    admin: {
        id: number;
        //authUserId: string;
        email: string;
        nombreCompleto: string;
    };
}

// Tipos para filtros en repository
export type ShelterQueryParams = {
    ciudad?: string;
    estado?: string;
    activo?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
    /** Filtro multitenant: limita el listado a un refugio específico */
    refugioId?: number;
};
export type ShelterListItem = Pick<
    Shelter,
    'id' | 'nombre_albergue' | 'ciudad' | 'estado' | 'activo' | 'fecha_registro'
>;

//
/*export type ShelterRecord = {
    id_refugio: number;
    nombre: string;
    ciudad: string;
    estado: string;
    correo_contacto: string;
    telefono: string | null;
    fecha_registro: Date;
    activo: boolean;
};*/
/*export interface ShelterFormProps {
    form: UseFormReturn<ShelterFormData>;
    onSubmit: (data: ShelterFormData) => Promise<void> | void;
    isLoading?: boolean;
    mode?: 'create' | 'edit';
}*/

export interface ShelterFormProps {
    form: UseFormReturn<ShelterFormValues>;
    onSubmit: (data: ShelterFormValues) => Promise<void>;
    mode: "create" | "edit";
    isLoading?: boolean;
}

export interface EditShelterFormProps {
    shelter: Shelter;
    id: number;
}


export interface ShelterWithAdminOutput {
    shelter: Shelter;
    nombreCompleto: string;
}