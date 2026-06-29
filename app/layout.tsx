// app/layout.tsx
import "../styles/index.css"

export default function RootLayout({
   children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="es">
        <body>{children}</body>
        </html>
    );
}