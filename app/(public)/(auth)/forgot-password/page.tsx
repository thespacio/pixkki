'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/modules/auth/service';
import { AuthRepository } from '@/modules/auth/repository';
import {sendPasswordResetAction} from "@/modules/auth/action";
import {Button} from "@/components/ui/button";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const result = await sendPasswordResetAction(email);

            if (!result.success) {
                setError(result.message);
                return;
            }

            setMessage("Hemos enviado un enlace de recuperación a tu correo electrónico");
            setEmail("");
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al enviar recuperación');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md w-full space-y-8">
            <div>
                <h1 className="text-3xl font-semibold text-foreground tracking-tight mb-2 mt-20">
                    ¿Olvidaste tu contraseña?
                </h1>
                <p className="text-sm text-muted-foreground mb-8">
                    Ingresa tu correo electrónico y te enviaremos un enlace para restablecerla
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5" htmlFor="email">
                        Correo electrónico
                    </label>
                    <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu@email.com"
                        className="w-full px-4 py-3 text-sm bg-card border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/25 placeholder:text-muted-foreground transition-shadow"
                    />
                </div>

                {error && (
                    <div className="text-red-500 text-sm">{error}</div>
                )}

                {message && (
                    <div className="text-green-500 text-sm">{message}</div>
                )}

                <button
                    type="submit"
                    disabled={ loading || !email }
                    className="w-full py-3 cursor-pointer rounded-xl text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-60 mt-2 flex items-center justify-center gap-2"
                    style={{ backgroundColor: '#43AE6D' }}
                >

                {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
                </button>

                <div className="text-center mt-4">
                    <a href="/login" className="text-xs text-primary hover:opacity-75 transition-opacity">
                        Volver al login
                    </a>
                </div>
            </form>
        </div>
    );
}