// app/(protected)/settings/security/VerifyTotpForm.tsx
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface VerifyTotpFormProps {
    onSubmit: (code: string) => Promise<void>;
    isLoading?: boolean;
    buttonText?: string;
}

export function VerifyTotpForm({
                                   onSubmit,
                                   isLoading = false,
                                   buttonText = "Verificar",
                               }: VerifyTotpFormProps) {
    const [code, setCode] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (code.length !== 6) return;
        await onSubmit(code);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código de 6 dígitos
                </label>
                <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    className="text-center text-2xl tracking-widest"
                    disabled={isLoading}
                    autoFocus
                />
            </div>
            <Button
                type="submit"
                className="w-full"
                disabled={isLoading || code.length !== 6}
            >
                {isLoading ? "Verificando..." : buttonText}
            </Button>
        </form>
    );
}