"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
            <div className="space-y-2">
                <label
                    htmlFor="totp-disable-code"
                    className="text-sm font-medium text-foreground"
                >
                    Código de 6 dígitos
                </label>
                <Input
                    id="totp-disable-code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    className="text-center font-mono text-lg tracking-[0.3em]"
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
