import { describe, it, expect, vi } from "vitest";
import { qaAnnotate } from "../../utils/qa";
import { AuthRepository } from "@/modules/auth/repository";
import { AuthService } from "@/modules/auth/service";
import { perRequest } from "@/lib/request-cache";

type FakeAuth = { getUser: ReturnType<typeof vi.fn>; signOut: ReturnType<typeof vi.fn> };

function fakeClient(getUser: FakeAuth["getUser"]) {
    const auth: FakeAuth = { getUser, signOut: vi.fn().mockResolvedValue({ error: null }) };
    return { auth } as unknown as ConstructorParameters<typeof AuthRepository>[0] & { auth: FakeAuth };
}

const okUser = {
    data: { user: { id: "u1", email: "a@b.com", email_confirmed_at: "2026-01-01", created_at: "2026-01-01" } },
    error: null,
};

describe("rendimiento: usuario de Auth una sola vez por petición", () => {
    it("varias consultas del mismo cliente hacen una sola llamada de red", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U90",
            categoria: "Rendimiento",
            criterio: "Pedir el usuario autenticado varias veces en la misma petición (layouts, página) consulta a Supabase Auth una sola vez, incluso si las llamadas son simultáneas.",
            prioridad: "Alta",
            notas: "Cada llamada a Supabase cuesta ~115 ms; antes se repetía 3 veces por carga.",
        });

        const getUser = vi.fn().mockResolvedValue(okUser);
        const client = fakeClient(getUser);

        // Dos repositorios distintos comparten cliente, como el layout y la página.
        const a = new AuthRepository(client);
        const b = new AuthRepository(client);

        const [u1, u2, u3] = await Promise.all([a.getAuthUser(), b.getAuthUser(), a.getAuthUser()]);
        const u4 = await b.getAuthUser();

        expect(getUser).toHaveBeenCalledTimes(1);
        expect(u1).toEqual(u2);
        expect(u3).toEqual(u4);
        expect(u1).toMatchObject({ id: "u1", email: "a@b.com", emailConfirmed: true });
    });

    it("clientes distintos (peticiones distintas) no comparten el resultado", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U91",
            categoria: "Seguridad",
            criterio: "El usuario memorizado nunca pasa de una petición a otra: cada cliente consulta por su cuenta.",
            prioridad: "Alta",
        });

        const getUserA = vi.fn().mockResolvedValue(okUser);
        const getUserB = vi.fn().mockResolvedValue({
            data: { user: { id: "u2", email: "otro@b.com", email_confirmed_at: "x", created_at: "x" } },
            error: null,
        });

        const userA = await new AuthRepository(fakeClient(getUserA)).getAuthUser();
        const userB = await new AuthRepository(fakeClient(getUserB)).getAuthUser();

        expect(userA.id).toBe("u1");
        expect(userB.id).toBe("u2");
        expect(getUserA).toHaveBeenCalledTimes(1);
        expect(getUserB).toHaveBeenCalledTimes(1);
    });

    it("un fallo (sin sesión) no se memoriza y se vuelve a intentar", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U92",
            categoria: "Seguridad",
            criterio: "Si no hay sesión válida, el error no queda guardado: al iniciar sesión la siguiente consulta vuelve a preguntar a Supabase.",
            prioridad: "Alta",
        });

        const getUser = vi
            .fn()
            .mockResolvedValueOnce({ data: { user: null }, error: { message: "no session" } })
            .mockResolvedValueOnce(okUser);
        const repo = new AuthRepository(fakeClient(getUser));

        await expect(repo.getAuthUser()).rejects.toThrow("Usuario no autenticado");
        await expect(repo.getAuthUser()).resolves.toMatchObject({ id: "u1" });
        expect(getUser).toHaveBeenCalledTimes(2);
    });

    it("cerrar sesión descarta el usuario memorizado", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U93",
            categoria: "Seguridad",
            criterio: "Después de cerrar sesión no se reutiliza el usuario anterior.",
            prioridad: "Alta",
        });

        const getUser = vi.fn().mockResolvedValue(okUser);
        const client = fakeClient(getUser);
        const repo = new AuthRepository(client);

        await repo.getAuthUser();
        await repo.signOut();
        await repo.getAuthUser();

        expect(client.auth.signOut).toHaveBeenCalledTimes(1);
        expect(getUser).toHaveBeenCalledTimes(2);
    });
});

describe("rendimiento: getCurrentUser", () => {
    it("pide el rol y los permisos en paralelo", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U94",
            categoria: "Rendimiento",
            criterio: "El nombre del rol y la lista de permisos se consultan a la vez (un viaje a la base de datos menos por petición).",
            prioridad: "Alta",
        });

        const started: string[] = [];
        let releaseRole!: (v: string) => void;
        let releasePerms!: (v: string[]) => void;

        const repository = {
            getAuthUser: vi.fn().mockResolvedValue({ id: "u1", email: "a@b.com", emailConfirmed: true, createdAt: "x" }),
            findUserContext: vi.fn().mockResolvedValue({
                idUsuario: 1, idRefugio: 2, nombreCompleto: "Ana", correo: "a@b.com",
                rol: 3, activo: true, ultimoLogin: null, authUserId: "u1",
            }),
            findRoleNameById: vi.fn().mockImplementation(
                () => new Promise<string>((resolve) => { started.push("rol"); releaseRole = resolve; }),
            ),
            findPermissionsByRole: vi.fn().mockImplementation(
                () => new Promise<string[]>((resolve) => { started.push("permisos"); releasePerms = resolve; }),
            ),
        };

        const service = new AuthService(repository as never, {} as never);
        const pending = service.getCurrentUser();

        // Ninguna de las dos ha terminado y las dos ya empezaron: están en paralelo.
        await vi.waitFor(() => expect(started).toHaveLength(2));
        expect(started.sort()).toEqual(["permisos", "rol"]);

        releaseRole("Superadmin");
        releasePerms(["animals.view"]);

        await expect(pending).resolves.toMatchObject({
            id: 1,
            shelterId: 2,
            role: "Superadmin",
            permissions: ["animals.view"],
        });
    });
});

describe("memoización por petición", () => {
    it("perRequest devuelve el mismo resultado que la función original", async (ctx) => {
        await qaAnnotate(ctx, {
            id: "TC-U95",
            categoria: "Unitaria",
            criterio: "Envolver una función con perRequest no cambia lo que devuelve (fuera del servidor simplemente la ejecuta).",
            prioridad: "Baja",
        });

        const fn = vi.fn(async (a: number, b: number) => a + b);
        const memo = perRequest(fn);

        await expect(memo(2, 3)).resolves.toBe(5);
        await expect(memo(4, 4)).resolves.toBe(8);
    });
});
