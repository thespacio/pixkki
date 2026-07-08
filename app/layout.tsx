
import { getCurrentUser } from "@/modules/auth/service";
import {AuthProvider} from "@/components/layouts/AuthProvider";
import "@/styles/index.css"

export default async function RootLayout({
                                             children,
                                         }: {
    children: React.ReactNode;
}) {
    let user = null;
    try {
        user = await getCurrentUser();
    } catch {
        user = null;
    }
    return (
        <html lang="es">
        <body>
        <AuthProvider initialUser={user}>
            {children}
        </AuthProvider>
        </body>
        </html>
    );

}