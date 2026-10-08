'use client';

/*
 * Hooks legados de formulario de refugio.
 * El flujo actual usa `hooks/useCreateShelterForm` y
 * `hooks/useUpdateShelterForm`.




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
