"use client";

import { useState } from "react";

import { Check, Copy } from "lucide-react";

import { QRCodeSVG } from "qrcode.react";

import { Button } from "@/components/ui/button";

interface Props {
    uri: string;
    secret: string;
}

export function QrCodeCard({
                               uri,
                               secret,
                           }: Props) {

    const [copied, setCopied] =
        useState(false);

    async function handleCopy() {

        await navigator.clipboard.writeText(
            secret
        );

        setCopied(true);

        setTimeout(() => {

            setCopied(false);

        }, 2000);

    }

    return (

        <div className="space-y-6">

            <div className="flex flex-col items-center">

                <div className="rounded-lg border bg-white p-4">

                    <QRCodeSVG
                        value={uri}
                        size={220}
                        includeMargin
                    />

                </div>

                <p className="mt-3 text-sm text-muted-foreground">

                    Escanea este código con Google Authenticator.

                </p>

            </div>

            <div className="rounded-lg border bg-muted/30 p-4">

                <div className="flex items-center justify-between gap-4">

                    <div>

                        <p className="text-xs text-muted-foreground">

                            Clave secreta

                        </p>

                        <code className="font-mono text-sm tracking-widest">

                            {secret}

                        </code>

                    </div>

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleCopy}
                    >

                        {

                            copied

                                ?

                                <Check className="h-4 w-4"/>

                                :

                                <Copy className="h-4 w-4"/>

                        }

                    </Button>

                </div>

            </div>

        </div>

    );

}