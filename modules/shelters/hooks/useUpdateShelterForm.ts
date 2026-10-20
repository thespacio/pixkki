import {useState} from "react";
import {useForm} from "react-hook-form";
import {UpdateShelterSchema} from "@/modules/shelters/schemas";
import {zodResolver} from "@hookform/resolvers/zod";
import {UpdateShelterInput} from "@/modules/shelters/types";

export function useUpdateShelterForm(
    shelter: UpdateShelterInput
) {
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<UpdateShelterInput>({
        resolver: zodResolver(UpdateShelterSchema),
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