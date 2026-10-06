// Este módulo no requiere autorización
// El envío de correo de restablecimiento es público

export function ensureForgotPasswordAllowed() {
    // No hay restricciones para solicitar restablecimiento
    // Esto previene user enumeration
    return;
}