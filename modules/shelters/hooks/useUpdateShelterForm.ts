import {useState} from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {ShelterFormSchema} from "@/modules/shelters/schemas";
import {ShelterFormValues} from "@/modules/shelters/types";

export function useUpdateShelterForm(
    shelter: ShelterFormValues
) {
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<ShelterFormValues>({
        resolver: zodResolver(ShelterFormSchema),
        defaultValues: shelter,
        mode: "onBlur",
        reValidateMode: "onChange",
    });

    return {
        form,
        isLoading,
        setIsLoading,
    };
}
