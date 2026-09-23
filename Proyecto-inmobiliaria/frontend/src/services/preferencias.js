const PREFIJO_COOKIE = 'gu_';

export function obtenerCookie(nombre) {
    if (typeof document === 'undefined') {
        return null;
    }

    const prefijo = `${PREFIJO_COOKIE}${nombre}=`;
    const parte = document.cookie
        .split('; ')
        .find((item) => item.startsWith(prefijo));

    if (!parte) {
        return null;
    }

    return decodeURIComponent(parte.slice(prefijo.length));
}

export function definirCookie(nombre, valor, dias = 180) {
    if (typeof document === 'undefined') {
        return;
    }

    const expira = new Date(Date.now() + dias * 86400000).toUTCString();
    document.cookie = `${PREFIJO_COOKIE}${nombre}=${encodeURIComponent(valor)}; expires=${expira}; path=/; sameSite=Lax`;
}

export function borrarCookie(nombre) {
    if (typeof document === 'undefined') {
        return;
    }

    document.cookie = `${PREFIJO_COOKIE}${nombre}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}
