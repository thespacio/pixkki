'use client';


import { useRouter } from 'next/navigation';
import {EditShelterFormProps, Shelter, ShelterFormValues} from "@/modules/shelters/types";
import {updateShelterAction} from "@/modules/shelters/actions";
import {ShelterForm} from "@/modules/shelters/ShelterForm/ShelterForm";
import {useUpdateShelterForm} from "@/modules/shelters/hooks/useUpdateShelterForm";

export function EditShelterForm({ shelter, id}: EditShelterFormProps) {
    const router = useRouter();
    const { form, isLoading, setIsLoading } = useUpdateShelterForm(shelter);

    async function onSubmit(data: ShelterFormValues) {
        setIsLoading(true);
        console.log("probando...");
        try {
            const result = await updateShelterAction(id, data);
            if (result.success) {
                router.push(`/shelters/${id}`);
                router.refresh();
            } else {
                form.setError('root', {
                    //message: result.error || 'Error al actualizar el refugio',
                });
            }
        } catch (error) {
            form.setError('root', {
                message: 'Error inesperado al actualizar el refugio',
            });
        } finally {
            setIsLoading(false);
        }
    }


    return (
        <ShelterForm
            form={form}
            onSubmit={onSubmit}
            isLoading={isLoading}
            mode="edit"
        />
    );
}