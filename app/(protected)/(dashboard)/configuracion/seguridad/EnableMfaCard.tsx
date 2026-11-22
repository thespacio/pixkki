"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { challenge, enrollTOTP, verify } from "@/modules/auth/mfa/client";

import { QrCodeCard } from "./QrCodeCard";

interface EnableMfaCardProps {
    onEnabled: () => Promise<void>;
}

export default function EnableMfaCard({ onEnabled }: EnableMfaCardProps) {
    const [loading, setLoading] = useState(false);
    const [code, setCode] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [enrollment, setEnrollment] = useState<Awaited<
        ReturnType<typeof enrollTOTP>
    > | null>(null);

    async function handleGenerate() {
        setLoading(true);
        setError(null);

        try {
            const result = await enrollTOTP();
            setEnrollment(result);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "No se pudo iniciar la configuración de MFA."
            );
        } finally {
            setLoading(false);
        }
    }

    async function handleVerify() {
        if (!enrollment) return;

        setLoading(true);
        setError(null);

        try {
            const challengeId = await challenge(enrollment.factorId);
            await verify(enrollment.factorId, challengeId, code);
            await onEnabled();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "No se pudo verificar el código."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <Card>
            <CardContent className="space-y-6 p-6">
                <div className="space-y-1">
                    <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
                        <ShieldCheck className="size-5 text-primary" aria-hidden="true" />
                        Autenticación de dos pasos
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Añade una capa extra de seguridad con Google Authenticator.
                    </p>
                </div>

                {error ? (
                    <Alert variant="destructive" role="alert">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                ) : null}

                {!enrollment ? (
                    <Button onClick={handleGenerate} disabled={loading}>
                        {loading ? "Generando..." : "Activar Google Authenticator"}
                    </Button>
                ) : (
                    <div className="space-y-4">
                        <QrCodeCard uri={enrollment.uri} secret={enrollment.secret} />

                        <div className="space-y-2">
                            <label
                                htmlFor="mfa-code"
                                className="text-sm font-medium text-foreground"
                            >
                                Código de verificación
                            </label>
                            <Input
                                id="mfa-code"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                placeholder="123456"
                                value={code}
                                maxLength={6}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                            />
                        </div>

                        <Button
                            disabled={loading || code.length !== 6}
                            onClick={handleVerify}
                        >
                            {loading ? "Verificando..." : "Verificar y activar"}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
