// modules/shelters/types.ts

import { z } from 'zod';
import {
    ShelterSchema,
    CreateShelterSchema,
    UpdateShelterSchema,
    ShelterFiltersSchema
} from './schemas';
import {AuthService} from "@/modules/auth/service";
import {ShelterRepository} from "@/modules/shelters/repository";
import {UserRepository} from "@/modules/users/repository";

// ===== ENTIDADES DEL DOMINIO =====
// Usamos z.infer para mantener consistencia con los schemas
export type Shelter = z.infer<typeof ShelterSchema>;
export type CreateShelterInput = z.infer<typeof CreateShelterSchema>;
export type UpdateShelterInput = z.infer<typeof UpdateShelterSchema>;
export type ShelterFilters = z.infer<typeof ShelterFiltersSchema>;


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
    'id' | 'nombre' | 'ciudad' | 'estado' | 'activo'
>;

/*
// ===== DTOs =====
// DTO para listado (versión reducida)


// DTO para detalles completos
export type ShelterDetails = Shelter;

*/

export type ShelterRecord = {
    id_refugio: number;
    nombre: string;
    ciudad: string;
    estado: string;
    correo_contacto: string;
    telefono: string | null;
    fecha_registro: Date;
    activo: boolean;
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
