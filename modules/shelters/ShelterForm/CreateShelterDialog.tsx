"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ZodError } from "zod";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { createShelterAction } from "@/modules/shelters/actions";
import { useCreateShelterForm } from "@/modules/shelters/hooks/useCreateShelterForm";
import { CreateShelterSchema } from "@/modules/shelters/schemas";
import type { ShelterFormValues } from "@/modules/shelters/types";

import { ShelterForm } from "./ShelterForm";

/**
 * Alta de refugio en overlay (`/refugios?nuevo=1`), sin salir del listado.
 *
 * Reutiliza el mismo formulario y el mismo schema Zod que la edición: la
 * validación no se duplica. Al cerrar se retira solo `?nuevo`, de modo que los
 * filtros y la página en curso se conservan.
 */
export function CreateShelterDialog() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { form, isLoading, setIsLoading } = useCreateShelterForm();

    function close() {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("nuevo");
        const query = params.toString();
        router.replace(query ? `/refugios?${query}` : "/refugios");
    }

    async function onSubmit(data: ShelterFormValues) {
        setIsLoading(true);
        form.clearErrors("root");

        try {
            const shelter = CreateShelterSchema.parse(data);
            await createShelterAction({ shelter });
            close();
        } catch (error) {
            if (error instanceof ZodError) {
                form.setError("root", {
                    message:
                        error.issues[0]?.message ??
                        "Revisa los datos del formulario antes de continuar.",
                });
                return;
            }

            form.setError("root", {
                message:
                    error instanceof Error && error.message
                        ? error.message
                        : "No se pudo crear el refugio. Inténtalo de nuevo.",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog
            open
            onOpenChange={(next) => {
                if (!next) close();
            }}
        >
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Dar de alta un refugio</DialogTitle>
                    <DialogDescription>
                        Se creará también la cuenta del administrador, que
                        recibirá una contraseña temporal por correo.
                    </DialogDescription>
                </DialogHeader>
                <ShelterForm
                    form={form}
                    onSubmit={onSubmit}
                    isLoading={isLoading}
                    mode="create"
                    onCancel={close}
                />
            </DialogContent>
        </Dialog>
    );
}
