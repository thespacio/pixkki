import {AuthProvider} from "@/components/layouts/AuthProvider";
import "@/styles/index.css"
import {getAuthUser, getCurrentUser} from "@/modules/auth";

export default async function RootLayout({
                                             children,
                                         }: {
    children: React.ReactNode;
}) {
    let user;
    try {
        user = await getAuthUser();
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