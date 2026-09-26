// modules/shelters/mapper.ts

import {
    Shelter,
    ShelterListItem,
    CreateShelterInput,
    UpdateShelterInput
} from './types';
import { ShelterRow, ShelterInsert, ShelterUpdate } from './repository';

/**
 * Mapea una fila de Supabase (ShelterRow) a una entidad de dominio (Shelter)
 */
export function mapShelterRowToDomain(row: ShelterRow): Shelter {
    return {
        id: row.id_refugio,
        nombre_albergue: row.nombre,
        ciudad: row.ciudad,
        estado: row.estado,
        correo_contacto: row.correo_contacto,
        telefono: row.telefono,
        fecha_registro: new Date(row.fecha_registro),
        activo: row.activo
    };
}

/**
 * Mapea una fila de Supabase a un ShelterListItem (versión reducida para listados)
 */
export function mapShelterRowToListItem(row: ShelterRow): ShelterListItem {
    return {
        id: row.id_refugio,
        nombre_albergue: row.nombre,
        ciudad: row.ciudad,
        estado: row.estado,
        activo: row.activo
    };
}

/**
 * Mapea una entidad de dominio o datos de entrada a ShelterInsert
 * (para operaciones de creación en Supabase)
 */
export function mapShelterToRow(
    data: Partial<Omit<Shelter, 'id' | 'fecha_registro'>> | CreateShelterInput | UpdateShelterInput
): ShelterInsert {
    const row: ShelterInsert = {ciudad: "", correo_contacto: "", estado: "", nombre: ""};

    if ('nombre_albergue' in data && data.nombre_albergue !== undefined) {
        row.nombre = data.nombre_albergue;
    }

    if ('ciudad' in data && data.ciudad !== undefined) {
        row.ciudad = data.ciudad;
    }

    if ('estado' in data && data.estado !== undefined) {
        row.estado = data.estado;
    }

    if ('correo_contacto' in data && data.correo_contacto !== undefined) {
        row.correo_contacto = data.correo_contacto;
    }

    if ('telefono' in data && data.telefono !== undefined) {
        row.telefono = data.telefono;
    }

    if ('activo' in data && data.activo !== undefined) {
        row.activo = data.activo;
    }

    return row;
}

/*


/!**
 * Mapea una entidad de dominio a ShelterRecord (para operaciones internas)
 *!/
export function mapShelterDomainToRecord(shelter: Shelter): ShelterRecord {
    return {
        id_refugio: shelter.id,
        nombre: shelter.nombre_albergue,
        ciudad: shelter.ciudad,
        estado: shelter.estado,
        correo_contacto: shelter.correo_contacto,
        telefono: shelter.telefono,
        fecha_registro: shelter.fecha_registro,
        activo: shelter.activo
    };
}

/!**
 * Mapea datos de formulario (CreateShelterInput) a ShelterRecord
 * Útil para pre-procesar datos antes de enviar al repository
 *!/
export function mapShelterInputToRecord(input: CreateShelterInput): Omit<ShelterRecord, 'id_refugio' | 'fecha_registro' | 'activo'> {
    return {
        nombre: input.nombre_albergue,
        ciudad: input.ciudad,
        estado: input.estado,
        correo_contacto: input.correo_contacto,
        telefono: input.telefono
    };
}

/!**
 * Mapea un ShelterRecord a Shelter (convierte de registro interno a dominio)
 *!/
export function mapShelterRecordToDomain(record: ShelterRecord): Shelter {
    return {
        id: record.id_refugio,
        nombre_albergue: record.nombre,
        ciudad: record.ciudad,
        estado: record.estado,
        correo_contacto: record.correo_contacto,
        telefono: record.telefono,
        fecha_registro: record.fecha_registro,
        activo: record.activo
    };
}

/!**
 * Mapea un Shelter a ShelterRecord (convierte de dominio a registro interno)
 *!/
export function mapShelterDomainToRow(shelter: Shelter): ShelterRow {
    return {
        id_refugio: shelter.id,
        nombre: shelter.nombre_albergue,
        ciudad: shelter.ciudad,
        estado: shelter.estado,
        correo_contacto: shelter.correo_contacto,
        telefono: shelter.telefono,
        fecha_registro: shelter.fecha_registro.toISOString(),
        activo: shelter.activo
    };
}

/!**
 * Mapea datos de actualización a ShelterUpdate (para operaciones de actualización en Supabase)
 *!/
export function mapShelterUpdateToRow(
    updates: Partial<Omit<Shelter, 'id' | 'fecha_registro'>>
): ShelterUpdate {
    const row: ShelterUpdate = {};

    if (updates.nombre_albergue !== undefined) {
        row.nombre = updates.nombre_albergue;
    }

    if (updates.ciudad !== undefined) {
        row.ciudad = updates.ciudad;
    }

    if (updates.estado !== undefined) {
        row.estado = updates.estado;
    }

    if (updates.correo_contacto !== undefined) {
        row.correo_contacto = updates.correo_contacto;
    }

    if (updates.telefono !== undefined) {
        row.telefono = updates.telefono;
    }

    if (updates.activo !== undefined) {
        row.activo = updates.activo;
    }

    return row;
}

/!**
 * Función helper para mapear arrays de ShelterRow a Shelter[]
 *!/
export function mapShelterRowsToDomain(rows: ShelterRow[]): Shelter[] {
    return rows.map(mapShelterRowToDomain);
}

/!**
 * Función helper para mapear arrays de ShelterRow a ShelterListItem[]
 *!/
export function mapShelterRowsToListItems(rows: ShelterRow[]): ShelterListItem[] {
    return rows.map(mapShelterRowToListItem);
}

/!**
 * Mapea datos de entrada para crear a los campos requeridos por Supabase
 * Asegura que todos los campos obligatorios estén presentes
 *!/
export function mapCreateShelterToInsert(input: CreateShelterInput): ShelterInsert {
    return {
        nombre: input.nombre_albergue,
        ciudad: input.ciudad,
        estado: input.estado,
        correo_contacto: input.correo_contacto,
        telefono: input.telefono || null,
        fecha_registro: new Date().toISOString(),
        activo: true
    };
}*/
