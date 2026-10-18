<<<<<<< HEAD
// modules/shelters/types.ts
=======
// modules/shelters/animales.types.ts
>>>>>>> origin/main

import { z } from 'zod';
import {
    ShelterSchema,
    CreateShelterSchema,
    UpdateShelterSchema,
<<<<<<< HEAD
    ShelterFiltersSchema
} from './schemas';
// ===== ENTIDADES DEL DOMINIO =====
// Usamos z.infer para mantener consistencia con los schemas
export type Shelter = z.infer<typeof ShelterSchema>;
=======
    ShelterFiltersSchema, ShelterFieldsSchema
} from './schemas';
import {DefaultValues, FieldValues, SubmitHandler, UseFormReturn} from "react-hook-form";

// ===== ENTIDADES DEL DOMINIO =====
// Usamos z.infer para mantener consistencia con los schemas
export type Shelter = z.infer<typeof ShelterSchema>;
export type ShelterFormValues = z.input<typeof ShelterFieldsSchema>;
>>>>>>> origin/main
export type CreateShelterInput = z.infer<typeof CreateShelterSchema>;
export type UpdateShelterInput = z.infer<typeof UpdateShelterSchema>;
export type ShelterFilters = z.infer<typeof ShelterFiltersSchema>;

<<<<<<< HEAD
=======
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
>>>>>>> origin/main

// Tipos para filtros en repository
export type ShelterQueryParams = {
    ciudad?: string;
    estado?: string;
    activo?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
};
<<<<<<< HEAD

export type ShelterListItem = Pick<
    Shelter,
    'id' | 'nombre' | 'ciudad' | 'estado' | 'activo'
>;

/*
// ===== DTOs =====
// DTO para listado (versión reducida)


// DTO para detalles completos
export type ShelterDetails = Shelter;

*/

export type ShelterRecord = {
=======
export type ShelterListItem = Pick<
    Shelter,
    'id' | 'nombre_albergue' | 'ciudad' | 'estado' | 'activo'
>;

//
/*export type ShelterRecord = {
>>>>>>> origin/main
    id_refugio: number;
    nombre: string;
    ciudad: string;
    estado: string;
    correo_contacto: string;
    telefono: string | null;
    fecha_registro: Date;
    activo: boolean;
<<<<<<< HEAD
};

/*
// ===== TIPOS COMPARTIDOS =====
// Tipos para el repository


// Tipos para el service
export type ShelterCreationResult = {
    shelter: Shelter;
    message: string;
};

export type ShelterUpdateResult = {
    shelter: Shelter;
    changes: string[];
};



// ===== TIPOS DE AUTORIZACIÓN =====
export type ShelterPermissions = {
    canView: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canManageAnimals: boolean;
};

// ===== TIPOS DE ERRORES =====
export type ShelterErrorCode =
    | 'NOT_FOUND'
    | 'DUPLICATE_NAME'
    | 'INVALID_STATUS'
    | 'PERMISSION_DENIED'
    | 'VALIDATION_ERROR'
    | 'DB_ERROR';*/
=======
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
>>>>>>> origin/main
