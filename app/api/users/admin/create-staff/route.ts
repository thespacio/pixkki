import { NextResponse } from "next/server";

import { createUser } from "@/modules/users/admin/service";
import { CreateUserSchema } from "@/modules/users/schemas";

export async function POST(request: Request) {
  try {
    const body = CreateUserSchema.parse(await request.json());

    const result = await createUser(body);

    return NextResponse.json(result, {
      status: 201,
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
          { error: error.message },
          { status: 400 }
      );
    }

    return NextResponse.json(
        { error: "Error interno" },
        { status: 500 }
    );
  }
}