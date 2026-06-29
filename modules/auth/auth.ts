const AUTH_KEY = "pixkki_auth";

export function login(email: string, password: string): boolean {
    if (password === "pixkki2024" && email.includes("@")) {
        sessionStorage.setItem(AUTH_KEY, JSON.stringify({ email, name: "Amara Osei" }));
        return true;
    }
    return false;
}

export function logout() {
    sessionStorage.removeItem(AUTH_KEY);
}

export function isAuthenticated(): boolean {
    return !!sessionStorage.getItem(AUTH_KEY);
}

export function getUser(): { email: string; name: string } | null {
    const raw = sessionStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
}
