import {useState} from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {CreateShelterSchema} from "@/modules/shelters/schemas";
import {ShelterFormValues} from "@/modules/shelters/types";

export function useCreateShelterForm() {
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<ShelterFormValues>({
        resolver: zodResolver(CreateShelterSchema),
        mode: "onBlur",
        reValidateMode: "onChange",
    });

    return {
        form,
        isLoading,
        setIsLoading,
    };
}