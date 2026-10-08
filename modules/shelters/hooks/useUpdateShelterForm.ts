import {useState} from "react";
import {useForm} from "react-hook-form";
import {UpdateShelterSchema} from "@/modules/shelters/schemas";
import {zodResolver} from "@hookform/resolvers/zod";
import {Shelter, ShelterFormValues} from "@/modules/shelters/types";

export function useUpdateShelterForm(
    shelter: Shelter
) {
    const [isLoading, setIsLoading] = useState(false);

    // Los campos de dirección del dominio pueden ser null (registros
    // previos); el formulario espera string | undefined.
    const defaultValues = {
        nombre_albergue: shelter.nombre_albergue,
        ciudad: shelter.ciudad,
        estado: shelter.estado,
        correo_contacto: shelter.correo_contacto,
        telefono: shelter.telefono,
        calle: shelter.calle ?? undefined,
        numero: shelter.numero ?? undefined,
        colonia: shelter.colonia ?? undefined,
        codigo_postal: shelter.codigo_postal ?? undefined,
    };

    const form = useForm<ShelterFormValues>({
        resolver: zodResolver(UpdateShelterSchema),
        defaultValues,
        mode: "onBlur",
        reValidateMode: "onChange",
    });

    return {
        form,
        isLoading,
        setIsLoading,
    };
}