"use client"

import { useState } from "react";
import {Pencil, Plus, Trash2, X} from "lucide-react";
import {ShelterSpace} from "@/app/dashboard/shelter-spaces/page";


interface Props {
    spaces: ShelterSpace[];
    setSpaces: React.Dispatch<React.SetStateAction<ShelterSpace[]>>;
}

export default function SpacesTable({
                                        spaces,
                                        setSpaces,
                                    }: Props) {
    const [showModal, setShowModal] = useState(false);

    const [spaceType, setSpaceType] = useState("Canil");
    const [spaceName, setSpaceName] = useState("");
    const [customType, setCustomType] = useState("");
    const [capacity, setCapacity] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);


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

    const handleDelete = (id: number) => {
        setSpaces((prev) => prev.filter((space) => space.id !== id));
    };

    const handleEdit = (space: ShelterSpace) => {
        setEditingId(space.id);

        setSpaceType(
            ["Canil", "Gatera", "Cuarentena", "Rehabilitación"].includes(space.type)
                ? space.type
                : "Otro"
        );

        if (
            !["Canil", "Gatera", "Cuarentena", "Rehabilitación"].includes(space.type)
        ) {
            setCustomType(space.type);
        }

        setSpaceName(space.name);
        setCapacity(space.capacity.toString());

        setShowModal(true);
    };

    return (
        <div className="bg-card border border-border rounded-2xl shadow-sm mt-6 overflow-hidden">

            <table className="w-full">

                <thead className="bg-muted">

                <tr className="text-left">

                    <th className="px-5 py-4 text-sm font-semibold">
                        Espacio
                    </th>

                    <th className="px-5 py-4 text-sm font-semibold">
                        Tipo
                    </th>

                    <th className="px-5 py-4 text-sm font-semibold">
                        Capacidad
                    </th>

                    <th className="px-5 py-4 text-sm font-semibold">
                        Ocupación
                    </th>

                    <th className="px-5 py-4 text-sm font-semibold">
                        Disponibles
                    </th>

                    <th className="px-5 py-4 text-sm font-semibold text-center">
                        Acciones
                    </th>

                </tr>

                </thead>

                <tbody>

                {spaces.length === 0 ? (

                    <tr>

                        <td
                            colSpan={6}
                            className="py-8 text-center text-muted-foreground"
                        >
                            No hay espacios registrados.
                        </td>

                    </tr>

                ) : (

                    spaces.map((space) => (

                        <tr
                            key={space.id}
                            className="border-t border-border"
                        >

                            <td className="px-5 py-4">
                                {space.name}
                            </td>

                            <td className="px-5 py-4">
                                {space.type}
                            </td>

                            <td className="px-5 py-4">
                                {space.capacity}
                            </td>

                            <td className="px-5 py-4">
                                {space.occupancy}
                            </td>

                            <td className="px-5 py-4 font-medium">
                                {space.capacity - space.occupancy}
                            </td>

                            <td className="px-5 py-4">

                                <div className="flex justify-center gap-3">

                                    <button
                                        onClick={() => handleEdit(space)}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        <Pencil size={18} />
                                    </button>

                                    <button
                                        onClick={() => handleDelete(space.id)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        <Trash2 size={18} />
                                    </button>

                                </div>

                            </td>

                        </tr>

                    ))

                )}

                </tbody>

            </table>

        </div>


    );
}