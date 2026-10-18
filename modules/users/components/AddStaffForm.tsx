"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CreateStaffSchema, STAFF_ROLES } from "@/modules/users/schemas";
import { createStaffAction } from "@/modules/users/actions/user.actions";
import {roleConfig} from "@/modules/users/types";

export default function AddStaffForm() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        role: STAFF_ROLES[0] as string,
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const parsed = CreateStaffSchema.safeParse(formData);

        if (!parsed.success) {
            const fieldErrors: Record<string, string> = {};

            for (const issue of parsed.error.issues) {
                const field = issue.path[0];

                if (typeof field === "string") {
                    fieldErrors[field] = issue.message;
                }
            }

            setErrors(fieldErrors);
            return;
        }

        setErrors({});

        startTransition(async () => {
            try {
                await createStaffAction(parsed.data);
                router.push("/dashboard/staff");
            } catch (error) {
                setErrors({
                    email:
                        error instanceof Error
                            ? error.message
                            : "Error al registrar personal",
                });
            }
        });
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setErrors((previous) => ({
            ...previous,
            [name]: "",
        }));
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="fullName">
                    Nombre completo
                </label>

                <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange}
                    disabled={isPending}
                />

                {errors.fullName && (
                    <p>{errors.fullName}</p>
                )}
            </div>

            <div>
                <label htmlFor="email">
                    Correo electrónico
                </label>

                <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isPending}
                />

                {errors.email && (
                    <p>{errors.email}</p>
                )}
            </div>

            <div>
                <label htmlFor="password">
                    Contraseña
                </label>

                <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isPending}
                />

                {errors.password && (
                    <p>{errors.password}</p>
                )}
            </div>

            <div>
                <label htmlFor="role">
                    Rol
                </label>

                <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    disabled={isPending}
                >
                    {STAFF_ROLES.map((role) => (
                        <option key={role} value={role}>
                            {roleConfig[role]?.label ?? role}
                        </option>
                    ))}
                </select>

                {errors.role && (
                    <p>{errors.role}</p>
                )}
            </div>

            <button
                type="submit"
                disabled={isPending}
            >
                {isPending ? "Registrando..." : "Registrar personal"}
            </button>
        </form>
    );
}