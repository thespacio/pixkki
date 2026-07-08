import { NextResponse } from "next/server";
import {CreateShelterSchema} from "@/modules/users/schemas";
import {createShelter} from "@/modules/users/superadmin/service";


export async function POST(request: Request) {
  try {
    const body = CreateShelterSchema.parse(await request.json());

    const result = await createShelter(body);

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