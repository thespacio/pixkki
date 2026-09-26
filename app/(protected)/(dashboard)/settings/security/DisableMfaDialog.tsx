// app/(protected)/settings/security/DisableMfaDialog.tsx
"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, ShieldOff, AlertTriangle } from "lucide-react";
import { VerifyTotpForm } from "./VerifyTotpForm";
import { challenge, verify, unenroll } from "@/modules/auth/mfa/client";

// ✅ Regex para validar UUID v4
const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface DisableMfaDialogProps {
    factor: {
        id: string;
        friendly_name: string;
    };
    onDisabled: () => void;
}

export function DisableMfaDialog(
    { factor, onDisabled }: DisableMfaDialogProps)
{
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState<"idle" | "verifying" | "success">("idle");
    const [error, setError] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);

    // 🔍 DEBUG: Ver qué contiene `factor` al montar el componente
    useEffect(() => {
        console.log("🔍 [DisableMfaDialog] factor recibido:", {
            factor,
            id: factor?.id,
            tipoId: typeof factor?.id,
            esUUID: UUID_REGEX.test(factor?.id ?? ""),
            friendly_name: factor?.friendly_name,
        });
    }, [factor]);

    const handleDisable = async (code: string) => {
        setIsLoading(true);
        setError("");

        // 🔍 DEBUG: Estado inicial del flujo
        console.log("🔍 [handleDisable] Inicio", {
            factorId: factor?.id,
            tipoFactorId: typeof factor?.id,
            esUUID: UUID_REGEX.test(factor?.id ?? ""),
            codigoLength: code?.length,
        });

        try {
            // ✅ VALIDACIÓN 1: factor.id debe existir y ser UUID
            if (!factor?.id) {
                throw new Error(
                    "No se encontró el ID del factor MFA. Recarga la página e inténtalo de nuevo."
                );
            }

            if (!UUID_REGEX.test(factor.id)) {
                console.error(
                    "❌ [handleDisable] factor.id NO es un UUID válido:",
                    factor.id
                );
                throw new Error(
                    `El ID del factor MFA no es válido: "${factor.id}". Contacta con soporte.`
                );
            }

            // ✅ VALIDACIÓN 2: el código debe tener 6 dígitos
            if (!code || !/^\d{6}$/.test(code)) {
                throw new Error("El código debe tener 6 dígitos.");
            }

            // 1) Crear challenge
            console.log("🔍 [handleDisable] Creando challenge...");
            const challengeResult = await challenge(factor.id);
            console.log("✅ [handleDisable] challengeId:", challengeResult);

            // ✅ VALIDACIÓN 3: el challenge debe devolver un id
            if (!challengeResult) {
                throw new Error(
                    "No se pudo crear el challenge de verificación. Inténtalo de nuevo."
                );
            }

            // 2) Verificar
            console.log("🔍 [handleDisable] Verificando código...");
            await verify(factor.id, challengeResult, code);
            console.log("✅ [handleDisable] Código verificado correctamente");

            // 3) Deshabilitar
            console.log("🔍 [handleDisable] Llamando a unenroll con:", {
                factorId: factor.id,
                tipo: typeof factor.id,
                esUUID: UUID_REGEX.test(factor.id),
            });

            await unenroll(factor.id);
            console.log("✅ [handleDisable] Factor deshabilitado correctamente");

            setStep("success");
            setTimeout(() => {
                setOpen(false);
                onDisabled();
            }, 1500);
        } catch (err) {
            // 🔍 DEBUG: mostrar el error completo
            console.error("❌ [handleDisable] Error:", err);

            let message = "Código incorrecto";

            if (err instanceof Error) {
                message = err.message;
            }

            // ✅ Mensajes más claros según el tipo de error
            if (message.includes("Invalid TOTP code")) {
                message = "El código es incorrecto o ha expirado. Inténtalo de nuevo.";
            } else if (message.includes("factor_id must be an UUID")) {
                message =
                    "El ID del factor MFA no es válido. Recarga la página e inténtalo de nuevo.";
            } else if (message.includes("challenge")) {
                message =
                    "No se pudo iniciar la verificación. Cierra el diálogo e inténtalo de nuevo.";
            }

            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg border p-6">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <h3 className="font-semibold flex items-center gap-2">
                            <Shield className="h-5 w-5 text-green-600" />
                            Autenticación de dos pasos
                        </h3>
                        <p className="text-sm text-gray-500">
                            Protege tu cuenta utilizando Google Authenticator
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            Activada
                        </span>
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-gray-500">Método</span>
                        <p className="font-medium">{factor.friendly_name}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">Estado</span>
                        <p className="font-medium text-green-600">Verificado</p>
                    </div>
                    {/* 🔍 DEBUG temporal: muestra el ID del factor en pantalla */}
                    <div className="col-span-2">
                        <span className="text-gray-500 text-xs">Factor ID (debug)</span>
                        <p className="font-mono text-xs break-all text-gray-400">
                            {factor.id || "(vacío)"}
                        </p>
                    </div>
                </div>

                <div className="mt-6 pt-6 border-t flex justify-end">
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button variant="destructive">
                                <ShieldOff className="h-4 w-4 mr-2" />
                                Deshabilitar
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-destructive" />
                                    Deshabilitar autenticación en dos pasos
                                </DialogTitle>
                                <DialogDescription>
                                    Para deshabilitar la autenticación en dos pasos, necesitas
                                    verificar tu identidad con un código de Google Authenticator.
                                </DialogDescription>
                            </DialogHeader>

                            {step === "success" ? (
                                <div className="py-8 text-center">
                                    <div className="bg-green-100 rounded-full p-3 mx-auto w-fit mb-4">
                                        <ShieldOff className="h-8 w-8 text-green-600" />
                                    </div>
                                    <p className="text-sm font-medium text-green-700">
                                        Autenticación deshabilitada
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-4">
                                        <Alert className="border-yellow-200 bg-yellow-50">
                                            <AlertDescription className="text-sm text-yellow-800">
                                                Al deshabilitar, tu cuenta quedará protegida
                                                únicamente con tu contraseña.
                                            </AlertDescription>
                                        </Alert>

                                        <VerifyTotpForm
                                            onSubmit={handleDisable}
                                            isLoading={isLoading}
                                            buttonText="Deshabilitar"
                                        />

                                        {error && (
                                            <Alert variant="destructive">
                                                <AlertDescription>{error}</AlertDescription>
                                            </Alert>
                                        )}
                                    </div>

                                    <DialogFooter>
                                        <Button
                                            variant="outline"
                                            onClick={() => setOpen(false)}
                                            disabled={isLoading}
                                        >
                                            Cancelar
                                        </Button>
                                    </DialogFooter>
                                </>
                            )}
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    );
}