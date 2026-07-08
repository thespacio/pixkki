// app/api/auth/logout/route.ts

import { NextResponse } from "next/server";

import { logout } from "@/modules/auth/service";

export async function POST() {

    try {

        await logout();

        return NextResponse.json(
            {
                success: true,
            },
            {
                status: 200,
            }
        );

    } catch (error) {

        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message: "No fue posible cerrar la sesión.",
            },
            {
                status: 500,
            }
        );

    }

}