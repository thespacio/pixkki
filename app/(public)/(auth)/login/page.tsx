'use client'

import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState} from 'react'

import {AuthError} from "@/modules/auth/errors";
import {login, verifyMfa} from "@/modules/auth/login/service";

export default function Login() {
  type LoginStep = "credentials" | "mfa";

  interface MfaChallenge {
    factorId: string;
    challengeId: string;
  }

  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [step, setStep] =
      useState<LoginStep>("credentials");

  const [twoFactorCode, setTwoFactorCode] =
      useState("");

  const [mfaChallenge, setMfaChallenge] =
      useState<MfaChallenge | null>(null);

  const handleSubmit = async (
      e: React.FormEvent
  ) => {

    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      if (step === "credentials") {
        const result = await login(
            email,
            password
        );

        switch (result.step) {
          case "mfa":
            setMfaChallenge({
              factorId: result.factorId!,
              challengeId:
                  result.challengeId!,
            });
            setStep("mfa");
            return;
          case "success":
            router.replace(
                "/dashboard"
            );
            router.refresh();
            return;
        }
      }
      if (step === "mfa") {
        if (!mfaChallenge) {
          throw new Error(
              "No existe un challenge MFA."
          );
        }
        await verifyMfa(
            mfaChallenge.factorId,
            mfaChallenge.challengeId,
            twoFactorCode
        );
        router.replace(
            "/dashboard"
        );
        router.refresh();
      }
    }

    catch (error) {
      console.error(
          "Error durante login:",
          error
      );
      if (
          error instanceof AuthError
      ) {
        setError(
            error.message
        );
      } else {
        setError(
            "Ha ocurrido un error inesperado."
        );
      }
    }
    finally {
      setLoading(false);
    }

  };

  return (
    <div>
      {/*<div className="flex items-center gap-2.5 mb-10">
        <div className="w-9 h-9 px-1 py-1 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: '#43AE6D' }}>
          <img src={logo} alt="Logo" />
        </div>
        <span className="text-lg font-semibold tracking-tight text-foreground">
          Pixkki
        </span>
      </div>*/}
      <h1 className="text-3xl font-semibold text-foreground tracking-tight mb-2 mt-20">
        Bienvenido de vuelta
      </h1>
      <p className="text-sm text-muted-foreground mb-8">Inicia sesión con tu cuenta</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5" htmlFor="email">
            Correo electrónico
          </label>
          <input
            id="email" type="email" autoComplete="email" required
            value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@albergue.com"
            className="w-full px-4 py-3 text-sm bg-card border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/25 placeholder:text-muted-foreground transition-shadow"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-foreground" htmlFor="password">
              Contraseña
            </label>
            <a href={"/forgot-password"} className="cursor-pointer text-xs text-primary hover:opacity-75 transition-opacity">
              ¿Olvidaste tu contraseña?
            </a>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
              className="w-full px-4 py-3 pr-11 text-sm bg-card border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/25 placeholder:text-muted-foreground transition-shadow"
            />
            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {/* Código de Google Authenticator */}
        {mfaChallenge && (
            <div>
              <label
                  htmlFor="twoFactorCode"
                  className="block text-sm font-medium text-foreground mb-2"
              >
                Código de autenticación
              </label>

              <input
                  id="twoFactorCode"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={twoFactorCode}
                  onChange={(e) =>
                      setTwoFactorCode(
                          e.target.value.replace(/\D/g, "")
                      )
                  }
                  placeholder="123456"
                  className="w-full px-4 py-3 text-sm bg-card border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/25"
              />
            </div>
        )}

        {error && (
            <div
                className="flex items-start gap-2 p-3 rounded-xl text-xs"
                style={{
                  backgroundColor: '#FDF2EA',
                  color: '#E8A87C' }}
            >
              <AlertCircle
                  size={13}
                  className="flex-shrink-0 mt-0.5"
              />
              {error}
            </div>
        )}

        <button
            type="submit"
            disabled={
                loading ||
                (
                    step === "credentials"
                        ? !email || !password
                        : twoFactorCode.length !== 6
                )
            }
            className="w-full py-3 cursor-pointer rounded-xl text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-60 mt-2 flex items-center justify-center gap-2"
            style={{ backgroundColor: '#43AE6D' }}>
          {
            loading
                ? "Procesando..."
                : step === "credentials"
                    ? "Iniciar sesión"
                    : "Verificar código"
          }
        </button>
      </form>
    </div>
  )
}