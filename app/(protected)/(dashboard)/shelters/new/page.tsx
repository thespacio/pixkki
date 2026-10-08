"use client";

import { useRouter } from "next/navigation";

import {ShelterForm} from "@/modules/shelters/ShelterForm/ShelterForm";
import {createShelterAction} from "@/modules/shelters/actions";
import {CreateShelterSchema} from "@/modules/shelters/schemas";
import {useCreateShelterForm} from "@/modules/shelters/hooks/useCreateShelterForm";
import {ShelterFormValues} from "@/modules/shelters/types";


export default function NewShelterPage() {
    const router = useRouter();
    const { form, isLoading, setIsLoading } = useCreateShelterForm();

    async function onSubmit(data: ShelterFormValues) {
        setIsLoading(true);

        try {
            const result = await createShelterAction({
                shelter: CreateShelterSchema.parse(data),
            });

            if (result.success) {
                router.push("/shelters");
                router.refresh();
            } else {
                form.setError("root", {
                    message: result.message,
                });
            }
        } catch {
            form.setError("root", {
                message: "Error inesperado al crear el refugio",
            });
        } finally {
            setIsLoading(false);
        }
    }
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Nuevo Albergue</h1>
                <p className="text-muted-foreground mt-1">
                    Completa los siguientes datos para registrar un nuevo albergue
                </p>
            </div>

            <ShelterForm
                form={form}
                onSubmit={onSubmit}
                isLoading={isLoading}
                mode="create"
            />
        </div>
    );
}