"use client";

import { useState } from "react";
import { AlertTriangle, Shield, ShieldOff } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { challenge, unenroll, verify } from "@/modules/auth/mfa/client";
import type { TotpFactor } from "@/modules/auth/types";

import { VerifyTotpForm } from "./VerifyTotpForm";

interface DisableMfaDialogProps {
    factor: TotpFactor;
    onDisabled: () => void | Promise<void>;
}

export function DisableMfaDialog({ factor, onDisabled }: DisableMfaDialogProps) {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState<"idle" | "success">("idle");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    async function handleDisable(code: string) {
        setIsLoading(true);
        setError("");

        try {
            if (!factor.factorId) {
                throw new Error(
                    "No se encontró el factor MFA. Recarga la página e inténtalo de nuevo."
                );
            }

            const challengeId = await challenge(factor.factorId);
            await verify(factor.factorId, challengeId, code);
            await unenroll(factor.factorId);

            setStep("success");
            setTimeout(() => {
                setOpen(false);
                setStep("idle");
                void onDisabled();
            }, 1200);
        } catch (err) {
            let message = "No se pudo deshabilitar la autenticación en dos pasos.";

            if (err instanceof Error && err.message) {
                message = err.message;
            }

            if (message.includes("Invalid TOTP code")) {
                message = "El código es incorrecto o ha expirado. Inténtalo de nuevo.";
            }

            setError(message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Card>
            <CardContent className="space-y-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                        <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
                            <Shield className="size-5 text-primary" aria-hidden="true" />
                            Autenticación de dos pasos
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Tu cuenta está protegida con Google Authenticator.
                        </p>
                    </div>
                    <span className="inline-flex w-fit items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                        Activada
                    </span>
                </div>

                <dl className="grid gap-4 text-sm sm:grid-cols-2">
                    <div>
                        <dt className="text-muted-foreground">Método</dt>
                        <dd className="font-medium text-foreground">
                            {factor.friendlyName || "Google Authenticator"}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-muted-foreground">Estado</dt>
                        <dd className="font-medium text-primary">Verificado</dd>
                    </div>
                </dl>

                <div className="flex justify-end border-t border-border pt-4">
                    <Dialog
                        open={open}
                        onOpenChange={(nextOpen) => {
                            setOpen(nextOpen);
                            if (!nextOpen) {
                                setStep("idle");
                                setError("");
                                setIsLoading(false);
                            }
                        }}
                    >
                        <DialogTrigger asChild>
                            <Button variant="destructive">
                                <ShieldOff className="size-4" aria-hidden="true" />
                                Deshabilitar
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <AlertTriangle
                                        className="size-5 text-destructive"
                                        aria-hidden="true"
                                    />
                                    Deshabilitar autenticación en dos pasos
                                </DialogTitle>
                                <DialogDescription>
                                    Confirma tu identidad con un código de Google Authenticator
                                    para deshabilitar la autenticación en dos pasos.
                                </DialogDescription>
                            </DialogHeader>

                            {step === "success" ? (
                                <div className="py-6 text-center">
                                    <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10">
                                        <ShieldOff className="size-6 text-primary" aria-hidden="true" />
                                    </div>
                                    <p className="text-sm font-medium text-foreground">
                                        Autenticación deshabilitada
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <Alert>
                                        <AlertDescription>
                                            Al deshabilitarla, tu cuenta quedará protegida únicamente
                                            con tu contraseña.
                                        </AlertDescription>
                                    </Alert>

                                    <VerifyTotpForm
                                        onSubmit={handleDisable}
                                        isLoading={isLoading}
                                        buttonText="Deshabilitar"
                                    />

                                    {error ? (
                                        <Alert variant="destructive" role="alert">
                                            <AlertDescription>{error}</AlertDescription>
                                        </Alert>
                                    ) : null}

                                    <DialogFooter>
                                        <Button
                                            variant="outline"
                                            onClick={() => setOpen(false)}
                                            disabled={isLoading}
                                        >
                                            Cancelar
                                        </Button>
                                    </DialogFooter>
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>
                </div>
            </CardContent>
        </Card>
    );
}
