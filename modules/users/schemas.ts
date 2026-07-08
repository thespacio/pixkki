import { z } from "zod";

export const CreateUserSchema = z.object({
    correo: z.email(),
    password: z.string().min(8),
    nombre_completo: z.string().min(3),
    nombre_rol: z.enum([
        "Veterinario",
        "Voluntario",
        "Recepcionista",
    ]),
});

export const CreateShelterSchema = z.object({
    nombre_refugio: z.string().toLowerCase().normalize('NFD'),
    ciudad: z.string().min(3),
    estado: z.string().min(5),
    telefono: z.string().min(5),
    correo_contacto : z.email(),
    correo_admin: z.email(),
    password: z.string().min(8)
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;