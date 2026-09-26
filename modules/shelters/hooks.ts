'use client';

import {Shelter, UpdateShelterInput} from "@/modules/shelters/types";
import {useState} from "react";
import {FieldValues, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {CreateShelterSchema, UpdateShelterSchema} from "@/modules/shelters/schemas";
import {updateShelterAction} from "@/modules/shelters/actions";
import {useRouter} from "next/navigation";


//hooks: manejan el estado y la lógica del formulario




/*
export function useShelterForm<T extends FieldValues>({
                                                          schema,
                                                          defaultValues,
                                                      }: UseShelterFormProps<T>) {
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<T>({
        resolver: zodResolver(schema),
        mode: "onBlur",
        reValidateMode: "onChange",
        defaultValues,
    });

    return {
        form,
        isLoading,
        setIsLoading,
    };
}
*/

/*
export function useShelterForm({
                                   mode,
                                   initialData
                               }: UseShelterFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const schema =
        mode === "create"
            ? CreateShelterSchema
            : UpdateShelterSchema;
    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues: initialData
    });
    /!*const form = useForm<ShelterFormData>({
        resolver: zodResolver(CreateShelterSchema),
        mode: "onBlur",
        reValidateMode: "onChange",
        defaultValues: initialData
    });*!/

    return {
        form,
        isLoading,
        setIsLoading,
    };
}*/
