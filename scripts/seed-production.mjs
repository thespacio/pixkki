// Seed de demostración para el entorno configurado en .env.local.
// Uso: npm run seed:production:dry | npm run seed:production
// Nunca imprime credenciales y nunca sobrescribe filas existentes.

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const APPLY = process.argv.includes("--apply");
const CONFIRM_VALUE = "PRODUCCION";
const PREFIJOS_DEMO = ["DEMO-", "DEMO "];

const REFUGIOS = [
    {
        slug: "demo-refugio-norte",
        nombre: "DEMO Refugio Norte",
        ciudad: "Monterrey",
        estado: "Nuevo León",
        correo_contacto: "demo.norte@pixkki.test",
        telefono: "+52 81 0000 0001",
        descripcion_publica: "Refugio ficticio para pruebas de demostración.",
    },
    {
        slug: "demo-refugio-sur",
        nombre: "DEMO Refugio Sur",
        ciudad: "Guadalajara",
        estado: "Jalisco",
        correo_contacto: "demo.sur@pixkki.test",
        telefono: "+52 33 0000 0002",
        descripcion_publica: "Refugio ficticio para pruebas de demostración.",
    },
];

const ESPACIOS = [
    {
        slug: "demo-refugio-norte",
        nombre_espacio: "DEMO Canil Norte",
        tipo: "canil",
        capacidad: 20,
        descripcion: "Espacio ficticio para datos de prueba",
    },
    {
        slug: "demo-refugio-sur",
        nombre_espacio: "DEMO Gatera Sur",
        tipo: "gatera",
        capacidad: 20,
        descripcion: "Espacio ficticio para datos de prueba",
    },
];

const USUARIOS = [
    {
        correo: "demo.superadmin@pixkki.test",
        nombre_completo: "DEMO Superadmin",
        rol: 3,
        slug: null,
    },
    {
        correo: "demo.admin.norte@pixkki.test",
        nombre_completo: "DEMO Admin Norte",
        rol: 1,
        slug: "demo-refugio-norte",
    },
    {
        correo: "demo.vet.norte@pixkki.test",
        nombre_completo: "DEMO Vet Norte",
        rol: 2,
        slug: "demo-refugio-norte",
    },
    {
        correo: "demo.admin.sur@pixkki.test",
        nombre_completo: "DEMO Admin Sur",
        rol: 1,
        slug: "demo-refugio-sur",
    },
    {
        correo: "demo.vet.sur@pixkki.test",
        nombre_completo: "DEMO Vet Sur",
        rol: 2,
        slug: "demo-refugio-sur",
    },
];

const ANIMALES = [
    { slug: "demo-refugio-norte", nombre: "DEMO Luna", especie: "Perro", raza: "Mestizo", sexo: "H", edad_estimada: 2, procedencia: "Rescate", rasgos_fisicos: "Pelaje corto color crema", estado_inicial: "Rescate", peso: 12.5, tamano: "Mediano", color: "Crema", temperamento: "Tranquilo" },
    { slug: "demo-refugio-norte", nombre: "DEMO Bruno", especie: "Perro", raza: "Labrador", sexo: "M", edad_estimada: 4, procedencia: "Rescate", rasgos_fisicos: "Pelaje dorado y porte robusto", estado_inicial: "Rescate", peso: 24, tamano: "Grande", color: "Dorado", temperamento: "Juguetón" },
    { slug: "demo-refugio-norte", nombre: "DEMO Canela", especie: "Gato", raza: "Mestizo", sexo: "H", edad_estimada: 1, procedencia: "Rescate", rasgos_fisicos: "Pelaje corto atigrado", estado_inicial: "Rescate", peso: 3.8, tamano: "Pequeño", color: "Atigrado", temperamento: "Dulce" },
    { slug: "demo-refugio-norte", nombre: "DEMO Pipo", especie: "Perro", raza: "Chihuahua", sexo: "M", edad_estimada: 3, procedencia: "Rescate", rasgos_fisicos: "Pelaje corto color café", estado_inicial: "Rescate", peso: 4.2, tamano: "Pequeño", color: "Café", temperamento: "Activo" },
    { slug: "demo-refugio-norte", nombre: "DEMO Nieve", especie: "Gato", raza: "Mestizo", sexo: "H", edad_estimada: 2, procedencia: "Rescate", rasgos_fisicos: "Pelaje blanco y ojos azules", estado_inicial: "Rescate", peso: 4.1, tamano: "Pequeño", color: "Blanco", temperamento: "Curioso" },
    { slug: "demo-refugio-sur", nombre: "DEMO Coco", especie: "Perro", raza: "Mestizo", sexo: "H", edad_estimada: 3, procedencia: "Rescate", rasgos_fisicos: "Pelaje corto color canela", estado_inicial: "Rescate", peso: 15, tamano: "Mediano", color: "Canela", temperamento: "Sociable" },
    { slug: "demo-refugio-sur", nombre: "DEMO Mocha", especie: "Gato", raza: "Mestizo", sexo: "M", edad_estimada: 2, procedencia: "Rescate", rasgos_fisicos: "Pelaje corto color gris", estado_inicial: "Rescate", peso: 4.5, tamano: "Pequeño", color: "Gris", temperamento: "Tranquilo" },
    { slug: "demo-refugio-sur", nombre: "DEMO Rey", especie: "Perro", raza: "Pastor", sexo: "M", edad_estimada: 5, procedencia: "Rescate", rasgos_fisicos: "Pelaje doble color negro y canela", estado_inicial: "Rescate", peso: 28, tamano: "Grande", color: "Negro", temperamento: "Protector" },
    { slug: "demo-refugio-sur", nombre: "DEMO Mimi", especie: "Gato", raza: "Mestizo", sexo: "H", edad_estimada: 1, procedencia: "Rescate", rasgos_fisicos: "Pelaje corto tricolor", estado_inicial: "Rescate", peso: 3.5, tamano: "Pequeño", color: "Tricolor", temperamento: "Dulce" },
    { slug: "demo-refugio-sur", nombre: "DEMO Tango", especie: "Perro", raza: "Mestizo", sexo: "M", edad_estimada: 4, procedencia: "Rescate", rasgos_fisicos: "Pelaje corto color negro", estado_inicial: "Rescate", peso: 18, tamano: "Mediano", color: "Negro", temperamento: "Enérgico" },
];

function requireEnv(nombre) {
    const valor = process.env[nombre];
    if (!valor || valor.trim() === "") {
        throw new Error(`Falta la variable de entorno ${nombre}. Revisa .env.local.`);
    }
    return valor;
}

function assertDemo(valor, entidad) {
    if (typeof valor !== "string" || !PREFIJOS_DEMO.some((prefijo) => valor.startsWith(prefijo))) {
        throw new Error(
            `El ${entidad} ya existe y no tiene prefijo demo (${PREFIJOS_DEMO.join(" / ")}). ` +
                "Abortando para no sobrescribir datos reales.",
        );
    }
}

function makeClient() {
    const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
    const serviceKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
    return createClient(url, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
    });
}

async function findOne(supabase, tabla, filtros) {
    let consulta = supabase.from(tabla).select("*");
    for (const [columna, valor] of Object.entries(filtros)) {
        consulta = consulta.eq(columna, valor);
    }
    const { data, error } = await consulta.maybeSingle();
    if (error) throw new Error(`No se pudo consultar ${tabla}: ${error.message}`);
    return data;
}

async function insertOne(supabase, tabla, valores) {
    const { data, error } = await supabase.from(tabla).insert(valores).select().single();
    if (error) throw new Error(`No se pudo crear en ${tabla}: ${error.message}`);
    return data;
}

async function findAuthUser(supabase, correo) {
    const porPagina = 200;
    let pagina = 1;
    while (true) {
        const { data, error } = await supabase.auth.admin.listUsers({
            page: pagina,
            perPage: porPagina,
        });
        if (error) throw new Error(`No se pudieron listar usuarios de Auth: ${error.message}`);
        const encontrado = data.users.find(
            (usuario) => usuario.email?.toLowerCase() === correo.toLowerCase(),
        );
        if (encontrado) return encontrado;
        if (data.users.length < porPagina) return null;
        pagina += 1;
    }
}

async function createAuthUser(supabase, correo, password) {
    const { data, error } = await supabase.auth.admin.createUser({
        email: correo,
        password,
        email_confirm: true,
        user_metadata: { origen: "seed-demo" },
    });
    if (error) throw new Error(`No se pudo crear la cuenta Auth ${correo}: ${error.message}`);
    return data.user;
}

async function ensureCatalog(supabase) {
    const { data: roles, error: rolesError } = await supabase
        .from("rol")
        .select("id_rol")
        .in("id_rol", [1, 2, 3]);
    if (rolesError) throw new Error(`No se pudo consultar el catálogo de roles: ${rolesError.message}`);

    const ids = new Set((roles ?? []).map((rol) => rol.id_rol));
    const faltantes = [1, 2, 3].filter((id) => !ids.has(id));
    if (faltantes.length > 0) {
        throw new Error(`Faltan los roles ${faltantes.join(", ")}. El seed no crea catálogos.`);
    }

    const estado = await findOne(supabase, "animal_estado", { nombre_estado: "Cuarentena" });
    if (!estado) {
        throw new Error('Falta el estado "Cuarentena". El seed no crea catálogos.');
    }
    return estado.id_estado;
}

async function main() {
    const password = requireEnv("SEED_DEMO_PASSWORD");
    if (process.env.PIXKKI_SEED_CONFIRM !== CONFIRM_VALUE) {
        throw new Error(
            `Se requiere PIXKKI_SEED_CONFIRM=${CONFIRM_VALUE} para sembrar el entorno configurado.`,
        );
    }

    const supabase = makeClient();
    const idEstado = await ensureCatalog(supabase);
    const acciones = [];

    const refugioIds = new Map();
    for (const refugio of REFUGIOS) {
        const existente = await findOne(supabase, "refugio", { slug: refugio.slug });
        if (existente) {
            assertDemo(existente.nombre, `refugio "${refugio.slug}"`);
            refugioIds.set(refugio.slug, existente.id_refugio);
        } else {
            refugioIds.set(refugio.slug, null);
            acciones.push(`crear refugio ${refugio.slug}`);
        }
    }

    const espacioIds = new Map();
    for (const espacio of ESPACIOS) {
        const idRefugio = refugioIds.get(espacio.slug);
        if (idRefugio === null) {
            espacioIds.set(espacio.nombre_espacio, null);
            acciones.push(`crear espacio ${espacio.nombre_espacio}`);
            continue;
        }
        const existente = await findOne(supabase, "espacio", {
            id_refugio: idRefugio,
            nombre_espacio: espacio.nombre_espacio,
        });
        if (existente) {
            assertDemo(existente.nombre_espacio, `espacio "${espacio.nombre_espacio}"`);
            espacioIds.set(espacio.nombre_espacio, existente.id_espacio);
        } else {
            espacioIds.set(espacio.nombre_espacio, null);
            acciones.push(`crear espacio ${espacio.nombre_espacio}`);
        }
    }

    const usuariosRows = new Map();
    const authIds = new Map();
    for (const usuario of USUARIOS) {
        const existente = await findOne(supabase, "usuario", { correo: usuario.correo });
        if (existente) {
            assertDemo(existente.nombre_completo, `usuario "${usuario.correo}"`);
            if (
                existente.auth_user_id !== null &&
                existente.auth_user_id !== undefined
            ) {
                const authUser = await findAuthUser(supabase, usuario.correo);
                if (authUser && authUser.id !== existente.auth_user_id) {
                    throw new Error(`El usuario ${usuario.correo} ya está vinculado a otra cuenta Auth.`);
                }
            }
        } else {
            acciones.push(`crear usuario ${usuario.correo}`);
        }
        usuariosRows.set(usuario.correo, existente ?? null);

        const authUser = await findAuthUser(supabase, usuario.correo);
        if (authUser) authIds.set(usuario.correo, authUser.id);
        else {
            authIds.set(usuario.correo, null);
            acciones.push(`crear cuenta Auth ${usuario.correo}`);
        }
    }

    for (const animal of ANIMALES) {
        const idRefugio = refugioIds.get(animal.slug);
        if (idRefugio === null) {
            acciones.push(`crear animal ${animal.nombre}`);
            continue;
        }
        const existente = await findOne(supabase, "animal", {
            id_refugio: idRefugio,
            nombre: animal.nombre,
        });
        if (existente) assertDemo(existente.nombre, `animal "${animal.nombre}"`);
        else acciones.push(`crear animal ${animal.nombre}`);
    }

    console.log(`[seed] ${acciones.length} acciones planeadas:`);
    for (const accion of acciones) console.log(`  - ${accion}`);

    if (!APPLY) {
        console.log("[seed] dry-run: no se escribió nada.");
        return;
    }

    for (const refugio of REFUGIOS) {
        if (refugioIds.get(refugio.slug) !== null) continue;
        const fila = await insertOne(supabase, "refugio", {
            ...refugio,
            activo: true,
        });
        refugioIds.set(refugio.slug, fila.id_refugio);
    }

    for (const usuario of USUARIOS) {
        if (authIds.get(usuario.correo) !== null) continue;
        const authUser = await createAuthUser(supabase, usuario.correo, password);
        authIds.set(usuario.correo, authUser.id);
    }

    for (const espacio of ESPACIOS) {
        if (espacioIds.get(espacio.nombre_espacio) !== null) continue;
        const fila = await insertOne(supabase, "espacio", {
            id_refugio: refugioIds.get(espacio.slug),
            nombre_espacio: espacio.nombre_espacio,
            tipo: espacio.tipo,
            capacidad: espacio.capacidad,
            descripcion: espacio.descripcion,
            disponible: true,
        });
        espacioIds.set(espacio.nombre_espacio, fila.id_espacio);
    }

    for (const usuario of USUARIOS) {
        const existente = usuariosRows.get(usuario.correo);
        const authUserId = authIds.get(usuario.correo);
        if (!existente) {
            await insertOne(supabase, "usuario", {
                nombre_completo: usuario.nombre_completo,
                correo: usuario.correo,
                rol: usuario.rol,
                id_refugio: usuario.slug ? refugioIds.get(usuario.slug) : null,
                activo: true,
                auth_user_id: authUserId,
                debe_cambiar_password: true,
                primer_inicio_sesion: true,
            });
            continue;
        }
        if (!existente.auth_user_id) {
            const { error } = await supabase
                .from("usuario")
                .update({ auth_user_id: authUserId })
                .eq("id_usuario", existente.id_usuario)
                .is("auth_user_id", null);
            if (error) {
                throw new Error(`No se pudo vincular la cuenta Auth de ${usuario.correo}: ${error.message}`);
            }
        }
    }

    for (const animal of ANIMALES) {
        const idRefugio = refugioIds.get(animal.slug);
        const existente = await findOne(supabase, "animal", {
            id_refugio: idRefugio,
            nombre: animal.nombre,
        });
        if (existente) continue;
        const campos = { ...animal };
        delete campos.slug;
        await insertOne(supabase, "animal", {
            ...campos,
            id_refugio: idRefugio,
            id_estado: idEstado,
            id_espacio: espacioIds.get(
                animal.slug === "demo-refugio-norte" ? "DEMO Canil Norte" : "DEMO Gatera Sur",
            ),
            en_cuarentena: true,
            esterilizado: false,
            disponible_adopcion: false,
            activo: true,
            vacunado: true,
            desparasitado: true,
        });
    }

    console.log(`[seed] aplicado: ${acciones.length} acciones ejecutadas.`);
}

main().catch((error) => {
    console.error(`[seed] ${error.message}`);
    process.exitCode = 1;
});
