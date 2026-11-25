import { AdoptionApplicationRepository } from "../repositories/application.repository";
import { PublicCatalogRepository } from "../repositories/public-catalog.repository";
import {
    CatalogQuerySchema,
    PublicCatalogResponseSchema,
    PublicAnimalDetailSchema,
} from "../validators/catalog.validators";
import type {
    PublicCatalogResponseDTO,
    PublicAnimalDetailDTO,
} from "../dtos/public-catalog.dto";
import {
    CreateSolicitudPublicaBodySchema,
    type CreateSolicitudPublicaBody,
} from "../validators/application.validators";
import {
    DemasiadasSolicitudesError,
    FiltrosInvalidosError,
    MayoriaDeEdadNoDeclaradaError,
    PrivacidadNoAceptadaError,
    SolicitudInvalidaError,
} from "../errors";
import { rateLimit } from "@/lib/rate-limit";

export class PublicCatalogService {
    constructor(
        private readonly catalogRepository: PublicCatalogRepository,
        private readonly applicationRepository: AdoptionApplicationRepository,
    ) {}

    async listCatalog(query: unknown): Promise<PublicCatalogResponseDTO> {
        const parsed = CatalogQuerySchema.safeParse(query);
        if (!parsed.success) throw new FiltrosInvalidosError();

        const result = await this.catalogRepository.list(parsed.data);
        return PublicCatalogResponseSchema.parse(result);
    }

    async getAnimal(idAnimal: number): Promise<PublicAnimalDetailDTO> {
        const animal = await this.catalogRepository.getAnimal(idAnimal);
        return PublicAnimalDetailSchema.parse(animal);
    }

    async listRefugios() {
        return this.catalogRepository.listRefugios();
    }

    async getRefugio(slug: string) {
        return this.catalogRepository.getRefugio(slug);
    }

    async listByRefugio(slug: string, query: unknown): Promise<PublicCatalogResponseDTO> {
        const parsed = CatalogQuerySchema.safeParse(query);
        if (!parsed.success) throw new FiltrosInvalidosError();

        const result = await this.catalogRepository.listByRefugio(slug, parsed.data);
        return PublicCatalogResponseSchema.parse(result);
    }

    async submitApplication(idAnimal: number, body: unknown, ip: string) {
        const parsed = CreateSolicitudPublicaBodySchema.parse(body) as CreateSolicitudPublicaBody;

        // Honeypot antispam.
        if (parsed.sitio_web && parsed.sitio_web.trim() !== "") {
            throw new SolicitudInvalidaError();
        }
        if (parsed.acepta_politica_privacidad !== true) {
            throw new PrivacidadNoAceptadaError();
        }
        if (parsed.declara_mayor_edad !== true) {
            throw new MayoriaDeEdadNoDeclaradaError();
        }

        const ipLimit = rateLimit(`adoptions:ip:${ip}`, { windowMs: 60 * 60 * 1000, limit: 5 });
        if (!ipLimit.allowed) throw new DemasiadasSolicitudesError(ipLimit.retryAfterSeconds);

        const emailLimit = rateLimit(`adoptions:email:${parsed.correo.toLowerCase()}`, {
            windowMs: 60 * 60 * 1000,
            limit: 5,
        });
        if (!emailLimit.allowed) throw new DemasiadasSolicitudesError(emailLimit.retryAfterSeconds);

        return this.applicationRepository.createPublic(idAnimal, parsed);
    }
}