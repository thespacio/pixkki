import { RegisterForm } from "@/modules/auth/components/RegisterForm";

export default function RegisterPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-background px-4">
            <div className="w-full max-w-md">
                <RegisterForm />
            </div>
        </main>
    );
}