import { NextResponse } from "next/server";

import { getCurrentUser } from "@/modules/auth/service";

import { UnauthorizedError } from "@/modules/auth/errors";

export async function GET() {

    try {
        const user =
            await getCurrentUser();

        return NextResponse.json(
            {
                success: true,
                data: user,
            },
            {
                status: 200,
            }
        );
    }
    catch (error) {
        if (error instanceof UnauthorizedError) {

            return NextResponse.json(
                {
                    success: false,
                    message: error.message,
                },
                {
                    status: 401,
                }
            );

        }
        console.error(error);
        return NextResponse.json(
            {
                success: false,
                message: "Error interno del servidor.",
            },
            {
                status: 500,
            }
        );
    }
}