"use client";

import { useState } from "react";

import {
    enrollTOTP,
    challenge,
    verify,
} from "@/modules/auth/mfa/client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { QrCodeCard } from "./QrCodeCard";

export default function EnableMfaCard({
                                          onEnabled,
                                      }: {
    onEnabled: () => Promise<void>;
}) {

    const [loading, setLoading] =
        useState(false);

    const [code, setCode] =
        useState("");

    const [enrollment, setEnrollment] =
        useState<Awaited<
            ReturnType<typeof enrollTOTP>
        > | null>(null);

    async function handleGenerate() {

        setLoading(true);

        try {

            const result =
                await enrollTOTP();

            setEnrollment(result);

        } finally {

            setLoading(false);

        }

    }

    async function handleVerify() {

        if (!enrollment) return;

        setLoading(true);

        try {

            const challengeId =
                await challenge(
                    enrollment.factorId
                );

            await verify(
                enrollment.factorId,
                challengeId,
                code
            );

            await onEnabled();

        } finally {

            setLoading(false);

        }

    }

    return (

        <Card className="space-y-6 p-6">

            {

                !enrollment

                    ?

                    <Button
                        onClick={handleGenerate}
                        disabled={loading}
                    >

                        Activar Google Authenticator

                    </Button>

                    :

                    <>

                        <QrCodeCard
                            uri={enrollment.uri}
                            secret={enrollment.secret}
                        />

                        <Input
                            placeholder="123456"
                            value={code}
                            maxLength={6}
                            onChange={(e) =>
                                setCode(
                                    e.target.value
                                )
                            }
                        />

                        <Button
                            disabled={
                                loading ||
                                code.length !== 6
                            }
                            onClick={handleVerify}
                        >

                            Verificar

                        </Button>

                    </>

            }

        </Card>

    );

}