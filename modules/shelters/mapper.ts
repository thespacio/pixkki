// modules/shelters/mapper.ts

import {
    Shelter,
<<<<<<< HEAD
    ShelterRecord,
=======
>>>>>>> origin/main
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
<<<<<<< HEAD
        nombre: row.nombre,
=======
        nombre_albergue: row.nombre,
>>>>>>> origin/main
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
<<<<<<< HEAD
        nombre: row.nombre,
=======
        nombre_albergue: row.nombre,
>>>>>>> origin/main
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

<<<<<<< HEAD
    if ('nombre' in data && data.nombre !== undefined) {
        row.nombre = data.nombre;
=======
    if ('nombre_albergue' in data && data.nombre_albergue !== undefined) {
        row.nombre = data.nombre_albergue;
>>>>>>> origin/main
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

<<<<<<< HEAD
/**
 * Mapea una entidad de dominio a ShelterRecord (para operaciones internas)
 */
export function mapShelterDomainToRecord(shelter: Shelter): ShelterRecord {
    return {
        id_refugio: shelter.id,
        nombre: shelter.nombre,
=======
/*


/!**
 * Mapea una entidad de dominio a ShelterRecord (para operaciones internas)
 *!/
export function mapShelterDomainToRecord(shelter: Shelter): ShelterRecord {
    return {
        id_refugio: shelter.id,
        nombre: shelter.nombre_albergue,
>>>>>>> origin/main
        ciudad: shelter.ciudad,
        estado: shelter.estado,
        correo_contacto: shelter.correo_contacto,
        telefono: shelter.telefono,
        fecha_registro: shelter.fecha_registro,
        activo: shelter.activo
    };
}

<<<<<<< HEAD
/**
 * Mapea datos de formulario (CreateShelterInput) a ShelterRecord
 * Útil para pre-procesar datos antes de enviar al repository
 */
export function mapShelterInputToRecord(input: CreateShelterInput): Omit<ShelterRecord, 'id_refugio' | 'fecha_registro' | 'activo'> {
    return {
        nombre: input.nombre,
=======
/!**
 * Mapea datos de formulario (CreateShelterInput) a ShelterRecord
 * Útil para pre-procesar datos antes de enviar al repository
 *!/
export function mapShelterInputToRecord(input: CreateShelterInput): Omit<ShelterRecord, 'id_refugio' | 'fecha_registro' | 'activo'> {
    return {
        nombre: input.nombre_albergue,
>>>>>>> origin/main
        ciudad: input.ciudad,
        estado: input.estado,
        correo_contacto: input.correo_contacto,
        telefono: input.telefono
    };
}

<<<<<<< HEAD
/**
 * Mapea un ShelterRecord a Shelter (convierte de registro interno a dominio)
 */
export function mapShelterRecordToDomain(record: ShelterRecord): Shelter {
    return {
        id: record.id_refugio,
        nombre: record.nombre,
=======
/!**
 * Mapea un ShelterRecord a Shelter (convierte de registro interno a dominio)
 *!/
export function mapShelterRecordToDomain(record: ShelterRecord): Shelter {
    return {
        id: record.id_refugio,
        nombre_albergue: record.nombre,
>>>>>>> origin/main
        ciudad: record.ciudad,
        estado: record.estado,
        correo_contacto: record.correo_contacto,
        telefono: record.telefono,
        fecha_registro: record.fecha_registro,
        activo: record.activo
    };
}

<<<<<<< HEAD
/**
 * Mapea un Shelter a ShelterRecord (convierte de dominio a registro interno)
 */
export function mapShelterDomainToRow(shelter: Shelter): ShelterRow {
    return {
        id_refugio: shelter.id,
        nombre: shelter.nombre,
=======
/!**
 * Mapea un Shelter a ShelterRecord (convierte de dominio a registro interno)
 *!/
export function mapShelterDomainToRow(shelter: Shelter): ShelterRow {
    return {
        id_refugio: shelter.id,
        nombre: shelter.nombre_albergue,
>>>>>>> origin/main
        ciudad: shelter.ciudad,
        estado: shelter.estado,
        correo_contacto: shelter.correo_contacto,
        telefono: shelter.telefono,
        fecha_registro: shelter.fecha_registro.toISOString(),
        activo: shelter.activo
    };
}

<<<<<<< HEAD
/**
 * Mapea datos de actualización a ShelterUpdate (para operaciones de actualización en Supabase)
 */
=======
/!**
 * Mapea datos de actualización a ShelterUpdate (para operaciones de actualización en Supabase)
 *!/
>>>>>>> origin/main
export function mapShelterUpdateToRow(
    updates: Partial<Omit<Shelter, 'id' | 'fecha_registro'>>
): ShelterUpdate {
    const row: ShelterUpdate = {};

<<<<<<< HEAD
    if (updates.nombre !== undefined) {
        row.nombre = updates.nombre;
=======
    if (updates.nombre_albergue !== undefined) {
        row.nombre = updates.nombre_albergue;
>>>>>>> origin/main
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

<<<<<<< HEAD
/**
 * Función helper para mapear arrays de ShelterRow a Shelter[]
 */
=======
/!**
 * Función helper para mapear arrays de ShelterRow a Shelter[]
 *!/
>>>>>>> origin/main
export function mapShelterRowsToDomain(rows: ShelterRow[]): Shelter[] {
    return rows.map(mapShelterRowToDomain);
}

<<<<<<< HEAD
/**
 * Función helper para mapear arrays de ShelterRow a ShelterListItem[]
 */
=======
/!**
 * Función helper para mapear arrays de ShelterRow a ShelterListItem[]
 *!/
>>>>>>> origin/main
export function mapShelterRowsToListItems(rows: ShelterRow[]): ShelterListItem[] {
    return rows.map(mapShelterRowToListItem);
}

<<<<<<< HEAD
/**
 * Mapea datos de entrada para crear a los campos requeridos por Supabase
 * Asegura que todos los campos obligatorios estén presentes
 */
export function mapCreateShelterToInsert(input: CreateShelterInput): ShelterInsert {
    return {
        nombre: input.nombre,
=======
/!**
 * Mapea datos de entrada para crear a los campos requeridos por Supabase
 * Asegura que todos los campos obligatorios estén presentes
 *!/
export function mapCreateShelterToInsert(input: CreateShelterInput): ShelterInsert {
    return {
        nombre: input.nombre_albergue,
>>>>>>> origin/main
        ciudad: input.ciudad,
        estado: input.estado,
        correo_contacto: input.correo_contacto,
        telefono: input.telefono || null,
        fecha_registro: new Date().toISOString(),
        activo: true
    };
<<<<<<< HEAD
}
=======
}*/
>>>>>>> origin/main
