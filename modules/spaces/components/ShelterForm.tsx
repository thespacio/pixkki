import { useState } from "react";
interface Props {
    shelterName: string;
    setShelterName: React.Dispatch<React.SetStateAction<string>>;
}

export default function ShelterForm({
                                        shelterName,
                                        setShelterName,
                                    }: Props) {

    return (
        <div className="space-y-6">
            {/* Información General */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-foreground">
                        Información General
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Registra la información básica del refugio.
                    </p>
                </div>

                <div>
                    <label
                        htmlFor="shelterName"
                        className="block text-sm font-medium text-foreground mb-2"
                    >
                        Nombre del Refugio
                    </label>

                    <input
                        id="shelterName"
                        type="text"
                        value={shelterName}
                        onChange={(e) => setShelterName(e.target.value)}
                        placeholder="Ej. Refugio Esperanza"
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20 transition"
                    />
                </div>
            </div>
        </div>
    );
}