// app/(protected)/settings/security/DisableMfaDialog.tsx
"use client";

import { useState } from "react";
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

interface DisableMfaDialogProps {
    factor: {
        id: string;
        friendly_name: string;
    };
    onDisabled: () => void;
}

export function DisableMfaDialog({ factor, onDisabled }: DisableMfaDialogProps) {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState<"idle" | "verifying" | "success">("idle");
    const [error, setError] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);

    const handleDisable = async (code: string) => {
        setIsLoading(true);
        setError("");

        try {
            // Crear challenge
            const challengeResult = await challenge(factor.id);

            // Verificar
            await verify(factor.id, challengeResult.id, code);

            // Deshabilitar
            await unenroll(factor.id);

            setStep("success");
            setTimeout(() => {
                setOpen(false);
                onDisabled();
            }, 1500);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Código incorrecto");
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
                                    Para deshabilitar la autenticación en dos pasos, necesitas verificar tu identidad con un código de Google Authenticator.
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
                                                Al deshabilitar, tu cuenta quedará protegida únicamente con tu contraseña.
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