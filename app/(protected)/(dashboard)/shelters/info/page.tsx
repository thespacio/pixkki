"use client";

import { useState } from "react";
import {Button} from "@/components/ui/button";
import {ArrowRight} from "lucide-react";
import ShelterForm from "@/modules/spaces/components/ShelterForm";


export interface ShelterSpace {
    id: number;
    name: string;
    type: string;
    capacity: number;
    occupancy: number;
}

export default function NewShelterPage() {
    const [shelterName, setShelterName] = useState("");

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">

            <ShelterForm
                shelterName={shelterName}
                setShelterName={setShelterName}
            />

            <div className={"w-full flex"}>
                <Button className="ms-auto ">
                    <ArrowRight size={18} />
                     Guardar
                </Button>
            </div>

        </div>
    );
}