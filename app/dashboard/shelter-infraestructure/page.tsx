"use client"

import { useState } from "react";
import { Plus, X } from "lucide-react";

export default function InfrastructureSection() {
    const [showModal, setShowModal] = useState(false);

    const [spaceType, setSpaceType] = useState("Canil");
    const [spaceName, setSpaceName] = useState("");
    const [customType, setCustomType] = useState("");
    const [capacity, setCapacity] = useState("");

    const handleAddSpace = () => {
        // Aquí posteriormente agregaremos el espacio a la tabla.
        console.log({
            type: spaceType === "Otro" ? customType : spaceType,
            name: spaceName,
            capacity: Number(capacity),
        });

        // Limpiar formulario
        setSpaceType("Canil");
        setSpaceName("");
        setCustomType("");
        setCapacity("");

        setShowModal(false);
    };

    return (
        <>
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm mt-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold">
                            Infraestructura
                        </h2>

                        <p className="text-sm text-muted-foreground mt-1">
                            Agrega los espacios físicos del refugio.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition"
                    >
                        <Plus size={18} />
                        Agregar Espacio
                    </button>
                </div>
            </div>

            {/* Modal */}

            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

                    <div className="w-full max-w-lg bg-background rounded-2xl shadow-xl border border-border">

                        {/* Header */}

                        <div className="flex items-center justify-between border-b border-border p-5">

                            <h3 className="text-lg font-semibold">
                                Nuevo Espacio
                            </h3>

                            <button
                                onClick={() => setShowModal(false)}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <X size={20} />
                            </button>

                        </div>

                        {/* Body */}

                        <div className="p-6 space-y-5">

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Tipo de espacio
                                </label>

                                <select
                                    value={spaceType}
                                    onChange={(e) => setSpaceType(e.target.value)}
                                    className="w-full rounded-xl border border-border px-4 py-3 bg-background"
                                >
                                    <option>Canil</option>
                                    <option>Gatera</option>
                                    <option>Cuarentena</option>
                                    <option>Rehabilitación</option>
                                    <option>Otro</option>
                                </select>
                            </div>

                            {spaceType === "Otro" && (
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Nombre del tipo
                                    </label>

                                    <input
                                        value={customType}
                                        onChange={(e) =>
                                            setCustomType(e.target.value)
                                        }
                                        placeholder="Ej. Área de maternidad"
                                        className="w-full rounded-xl border border-border px-4 py-3"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Nombre del espacio
                                </label>

                                <input
                                    value={spaceName}
                                    onChange={(e) =>
                                        setSpaceName(e.target.value)
                                    }
                                    placeholder="Ej. Canil A"
                                    className="w-full rounded-xl border border-border px-4 py-3"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Capacidad
                                </label>

                                <input
                                    type="number"
                                    min={1}
                                    value={capacity}
                                    onChange={(e) =>
                                        setCapacity(e.target.value)
                                    }
                                    placeholder="20"
                                    className="w-full rounded-xl border border-border px-4 py-3"
                                />
                            </div>
                        </div>

                        {/* Footer */}

                        <div className="border-t border-border p-5 flex justify-end gap-3">

                            <button
                                onClick={() => setShowModal(false)}
                                className="px-5 py-2 rounded-xl border border-border hover:bg-muted"
                            >
                                Cancelar
                            </button>

                            <button
                                onClick={handleAddSpace}
                                className="px-5 py-2 rounded-xl bg-primary text-primary-foreground hover:opacity-90"
                            >
                                Agregar Espacio
                            </button>

                        </div>

                    </div>

                </div>
            )}
        </>
    );
}