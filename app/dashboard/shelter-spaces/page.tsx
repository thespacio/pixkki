"use client";

import { useState } from "react";

import InfrastructureSection from "@/modules/dashboard/components/InfrastructureSection";
import SpacesTable from "@/modules/dashboard/components/SpacesTable";
import {Button} from "@/components/ui/button";
import {ArrowRight, Plus} from "lucide-react";


export interface ShelterSpace {
    id: number;
    name: string;
    type: string;
    capacity: number;
    occupancy: number;
}

export default function NewShelterPage() {
    const [shelterName, setShelterName] = useState("");
    const [spaces, setSpaces] = useState<ShelterSpace[]>([]);

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">

            <InfrastructureSection
                spaces={spaces}
                setSpaces={setSpaces}
            />

            <SpacesTable
                spaces={spaces}
                setSpaces={setSpaces}
            />

            <div className={"w-full flex"}>
                <Button className="ms-auto ">
                    <ArrowRight size={18} />
                     Continuar
                </Button>
            </div>

        </div>
    );
}