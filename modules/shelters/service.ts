
import { ShelterRepository } from './repository';
import { ShelterAuthorization } from './authorization';
import {
    Shelter,
    CreateShelterInput,
    UpdateShelterInput, ShelterQueryParams, ShelterListItem
} from './types';
import {
    ShelterNotFoundError,
    ShelterBusinessError,
    ShelterAuthorizationError
} from './errors';
import {AuthenticatedUser} from "@/modules/auth/types";

export class ShelterService {
    constructor(
        private readonly repository: ShelterRepository
    ) {}

    /**
     * Busca un refugio por su ID
     * Incluye verificación de autorización y manejo de casos de negocio
     */
    async findById(
        id: number,
        authContext: AuthenticatedUser
    ): Promise<Shelter> {
        // 1. Autorización: Verificar que el usuario puede ver refugios
        ShelterAuthorization.ensureCanView(authContext);

        // 2. Acceso a datos: Obtener el refugio
        const shelter = await this.repository.findById(id);

        // 3. Reglas de negocio: Verificar acceso específico al shelter
        // Si el usuario es admin, tiene acceso a todos los shelters
        if (authContext.role !== 'superadmin') {
            // Para otros roles, verificar acceso específico
            const hasAccess = await this.checkUserShelterAccess(
                Number(authContext.id),
                id
            );

            if (!hasAccess) {
                throw new ShelterAuthorizationError(
                    'No tienes acceso a este refugio',
                    {
                        userId: authContext.id,
                        role: authContext.role,
                        shelterId: id
                    }
                );
            }
        }

        // 4. Reglas de negocio: Los usuarios 'user' solo ven información básica
        // Los roles con más permisos ven información completa
        // Nota: Como la entidad Shelter ya es completa, aquí no hay transformación adicional
        // Si necesitáramos diferentes vistas, se podría mapear a DTOs diferentes

        return shelter;
    }

    /**
     * Devolver todos los refugios?
     * Incluye verificación de autorización y manejo de casos de negocio
     */
    async findAll(
        filters: ShelterQueryParams,
        authContext: AuthenticatedUser
    ): Promise<{
        data: ShelterListItem[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
            hasMore: boolean;
        };
    }> {
        // 1. Autorización: Verificar que el usuario puede ver refugios
        ShelterAuthorization.ensureCanView(authContext);

        // 2. Acceso a datos: Obtener todos los refugios con filtros
        const result = await this.repository.findAll(filters);

        // 3. Reglas de negocio: Si no es admin, filtrar por acceso
        if (authContext.role !== 'superadmin') {
            /*// Obtener IDs de shelters a los que tiene acceso
            const accessibleShelterIds = await this.getUserShelterIds(
                Number(authContext.id)
            );

            // Filtrar resultados
            const filteredData = result.data.filter(shelter =>
                accessibleShelterIds.includes(shelter.id)
            );*/

            // Retornar con la estructura correcta
            return {
                data: result.data,
                pagination: {
                    total: result.total,
                    limit: filters.limit || 10,
                    offset: filters.offset || 0,
                    hasMore:
                        (filters.offset ?? 0) + result.data.length < result.total
                }

            };
        }

        // 4. Retornar resultado original con la estructura correcta
        return {
            data: result.data,
            pagination: {
                total: result.total,
                limit: filters.limit || 10,
                offset: filters.offset || 0,
                hasMore: result.data.length === (filters.limit || 10)
            }
        };
    }

    /**
     * Crea un nuevo refugio
     * Incluye validaciones de negocio y autorización
     */
    async create(
        input: CreateShelterInput,
        authContext: AuthenticatedUser
    ) {
        // 1. Autorización: Verificar que el usuario puede crear refugios
        ShelterAuthorization.ensureCanCreate(authContext);

        // 2. Reglas de negocio: Validar unicidad del nombre
        const existingShelter = await this.repository.findByName(input.nombre_albergue);
        if (existingShelter) {
            throw new ShelterBusinessError(
                `Ya existe un refugio con el nombre "${input.nombre_albergue}"`,
                'DUPLICATE_NAME',
                { nombre: input.nombre_albergue }
            );
        }

        // 3. Reglas de negocio: Validar que la ciudad y estado sean válidos
        this.validateLocation(input.ciudad, input.estado);

        // 4. Crear el refugio en la base de datos
        const shelter = await this.repository.create(input);

        // 5. Reglas de negocio: Registrar la creación (log o evento)
        // Aquí se podría agregar logging o eventos de dominio
        // Por ejemplo: this.eventEmitter.emit('shelter.created', { shelter, userId: authContext.id });

        return {
            shelter,
            message: `Refugio "${shelter.nombre_albergue}" creado exitosamente`
        };
    }

    /**
     * Actualiza un refugio existente
     * Incluye validaciones de negocio y autorización
     */
    async update(
        id: number,
        updates: UpdateShelterInput,
        authContext: AuthenticatedUser
    ) {
        // 1. Autorización: Verificar que el usuario puede editar refugios
        const authContextWithShelter = {
            ...authContext,
            shelterId: id
        };
        //ShelterAuthorization.ensureCanEdit(authContextWithShelter);

        // 2. Obtener el refugio actual (verifica que existe)
        const currentShelter = await this.repository.findById(id);

        // 3. Reglas de negocio: Verificar acceso específico al shelter
        if (authContext.role !== 'admin') {
            const hasAccess = await this.checkUserShelterAccess(
                Number(authContext.id),
                id
            );

            if (!hasAccess) {
                throw new ShelterAuthorizationError(
                    'No tienes permisos para editar este refugio',
                    {
                        userId: authContext.id,
                        role: authContext.role,
                        shelterId: id
                    }
                );
            }
        }

        // 4. Reglas de negocio: Validar campos de actualización
        const changes: string[] = [];

        // Validar nombre (si se está actualizando)
        if (updates.nombre_albergue && updates.nombre_albergue !== currentShelter.nombre_albergue) {
            // Verificar que el nuevo nombre no esté en uso por otro refugio
            const exists = await this.repository.existsByName(updates.nombre_albergue, id);
            if (exists) {
                throw new ShelterBusinessError(
                    `Ya existe otro refugio con el nombre "${updates.nombre_albergue}"`,
                    'DUPLICATE_NAME',
                    { nombre: updates.nombre_albergue, currentId: id }
                );
            }
            changes.push(`nombre: "${currentShelter.nombre_albergue}" → "${updates.nombre_albergue}"`);
        }

        // Validar ubicación (si se está actualizando)
        if (updates.ciudad && updates.ciudad !== currentShelter.ciudad) {
            this.validateLocation(updates.ciudad, updates.estado || currentShelter.estado);
            changes.push(`ciudad: "${currentShelter.ciudad}" → "${updates.ciudad}"`);
        }

        if (updates.estado && updates.estado !== currentShelter.estado) {
            this.validateLocation(updates.ciudad || currentShelter.ciudad, updates.estado);
            changes.push(`estado: "${currentShelter.estado}" → "${updates.estado}"`);
        }

        // Validar contacto (si se está actualizando)
        if (updates.correo_contacto !== undefined &&
            updates.correo_contacto !== currentShelter.correo_contacto) {
            this.validateContact(updates.correo_contacto);
            changes.push(`correo_contacto: "${currentShelter.correo_contacto}" → "${updates.correo_contacto}"`);
        }

        /*if (updates.telefono !== undefined &&
            updates.telefono !== currentShelter.telefono) {
            this.validatePhone(updates.telefono);
            changes.push(`teléfono: "${currentShelter.telefono}" → "${updates.telefono}"`);
        }*/

        // Validar cambio de estado (activo/inactivo)
        /*if (updates.activo !== undefined &&
            updates.activo !== currentShelter.activo) {
            changes.push(`estado: ${currentShelter.activo ? 'activo' : 'inactivo'} → ${updates.activo ? 'activo' : 'inactivo'}`);
        }*/

        // 5. Si no hay cambios, retornar el refugio actual sin modificaciones
        if (changes.length === 0) {
            return {
                shelter: currentShelter,
                changes: ['No se realizaron cambios']
            };
        }

        // 6. Aplicar la actualización
        const updatedShelter = await this.repository.update(id, updates);

        // 7. Reglas de negocio: Registrar la actualización (log o evento)
        // this.eventEmitter.emit('shelter.updated', { shelter: updatedShelter, userId: authContext.id, changes });

        return {
            shelter: updatedShelter,
            changes
        };
    }

    // ===== Métodos privados de validación de negocio =====

    /**
     * Valida que la ubicación (ciudad/estado) sea válida
     * Esta es una regla de negocio que podría verificar contra un catálogo de ubicaciones
     */
    private validateLocation(ciudad: string, estado: string): void {
        // Regla de negocio: La ciudad y estado deben tener al menos 2 caracteres
        if (ciudad.length < 2) {
            throw new ShelterBusinessError(
                'La ciudad debe tener al menos 2 caracteres',
                'INVALID_LOCATION',
                { ciudad, estado }
            );
        }

        if (estado.length < 2) {
            throw new ShelterBusinessError(
                'El estado debe tener al menos 2 caracteres',
                'INVALID_LOCATION',
                { ciudad, estado }
            );
        }

        // Regla de negocio: No permitir caracteres especiales en ubicación (solo letras y espacios)
        const locationRegex = /^[a-zA-ZáéíóúñÑ\s]+$/;
        if (!locationRegex.test(ciudad)) {
            throw new ShelterBusinessError(
                'La ciudad solo puede contener letras y espacios',
                'INVALID_LOCATION',
                { ciudad, estado }
            );
        }

        if (!locationRegex.test(estado)) {
            throw new ShelterBusinessError(
                'El estado solo puede contener letras y espacios',
                'INVALID_LOCATION',
                { ciudad, estado }
            );
        }
    }

    /**
     * Valida que el contacto (correo) sea válido
     * Esta es una regla de negocio adicional a la validación de Zod
     */
    private validateContact(email: string | null | undefined): void {
        if (!email) return; // El correo es opcional

        // Regla de negocio: Verificar que el correo no sea de dominios temporales
        const tempEmailDomains = ['tempmail.com', 'throwaway.com', 'mailinator.com'];
        const domain = email.split('@')[1];
        if (domain && tempEmailDomains.includes(domain.toLowerCase())) {
            throw new ShelterBusinessError(
                'No se permiten correos de dominios temporales',
                'INVALID_EMAIL_DOMAIN',
                { email, domain }
            );
        }

        // Regla de negocio: Solo correos institucionales o Gmail/Outlook
        const allowedDomains = ['gmail.com', 'outlook.com', 'hotmail.com'];
        // Aquí podrías tener una lista de dominios permitidos según tu negocio
    }

    /**
     * Valida que el teléfono sea válido
     * Esta es una regla de negocio adicional a la validación de Zod
     */
    private validatePhone(phone: string | null | undefined): void {
        if (!phone) return; // El teléfono es opcional

        // Regla de negocio: Números de teléfono deben comenzar con código de país (+52 para México)
        // Esta regla asume que todos los shelters están en México
        const phoneRegex = /^\+[0-9]{10}$/;
        if (!phoneRegex.test(phone)) {
            throw new ShelterBusinessError(
                'El teléfono debe ser un número válido',
                'INVALID_PHONE',
                { phone }
            );
        }
    }

    /**
     * Verifica si un usuario tiene acceso a un shelter específico
     * Este método se delega a una función de verificación que podría usar un repository de relaciones
     */
    private async checkUserShelterAccess(
        userId: number,
        shelterId: number
    ): Promise<boolean> {
        // Aquí se implementaría la verificación de acceso:
        // - Verificar si el usuario es shelter_manager de este refugio
        // - Verificar si el usuario es volunteer en este refugio
        // - Para este ejemplo, asumimos que el shelter_manager tiene acceso
        // En una implementación real, esto consultaría un repository de relaciones usuario-shelter

        // Ejemplo de implementación:
        // const userShelterRepo = new UserShelterRepository(this.supabase);
        // return await userShelterRepo.userHasAccess(userId, shelterId);

        // Por ahora, retornamos true como placeholder
        return true;
    }
}