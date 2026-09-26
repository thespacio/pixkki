// modules/shelters/animales.types.ts

import { z } from 'zod';
import {
    ShelterSchema,
    CreateShelterSchema,
    UpdateShelterSchema,
    ShelterFiltersSchema, ShelterFieldsSchema
} from './schemas';
import {DefaultValues, FieldValues, SubmitHandler, UseFormReturn} from "react-hook-form";

// ===== ENTIDADES DEL DOMINIO =====
// Usamos z.infer para mantener consistencia con los schemas
export type Shelter = z.infer<typeof ShelterSchema>;
export type ShelterFormValues = z.input<typeof ShelterFieldsSchema>;
export type CreateShelterInput = z.infer<typeof CreateShelterSchema>;
export type UpdateShelterInput = z.infer<typeof UpdateShelterSchema>;
export type ShelterFilters = z.infer<typeof ShelterFiltersSchema>;

export interface CreateShelterWithAdminInput {
    shelter: CreateShelterInput;
}
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
};
export type ShelterListItem = Pick<
    Shelter,
    'id' | 'nombre_albergue' | 'ciudad' | 'estado' | 'activo'
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

interface ShelterFormProps {
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