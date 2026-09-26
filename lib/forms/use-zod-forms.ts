/*
import { useState } from "react";
import {
    DefaultValues,
    FieldValues, Resolver,
    useForm,
    UseFormProps,
} from "react-hook-form";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface UseZodFormProps<TSchema extends z.ZodTypeAny> {
    schema: TSchema;
    defaultValues?: DefaultValues<z.input<TSchema>>;
    mode?: UseFormProps<z.input<TSchema>>["mode"];
    reValidateMode?: UseFormProps<z.input<TSchema>>["reValidateMode"];
}

export function useZodForm<TSchema extends z.ZodTypeAny>({
                                                             schema,
                                                             defaultValues,
                                                             mode = "onBlur",
                                                             reValidateMode = "onChange",
                                                         }: UseZodFormProps<TSchema>) {

    const form = useForm<z.input<TSchema>, any, z.output<TSchema>>({
        resolver: zodResolver(schema),
        defaultValues,
        mode,
        reValidateMode,
    });

    return { form };
}*/


import {FieldValues, useForm, UseFormProps} from "react-hook-form";

export function useZodForm<T extends FieldValues>(
    options: UseFormProps<T>
) {
    return useForm(options);
}