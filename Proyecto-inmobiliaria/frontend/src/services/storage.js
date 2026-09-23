const PREFIJO = 'gi_';

export function leer(clave, respaldo = null) {
    try {
        const crudo = localStorage.getItem(PREFIJO + clave);
        return crudo === null ? respaldo : JSON.parse(crudo);
    } catch {
        return respaldo;
    }
}

export function guardar(clave, valor) {
    try {
        localStorage.setItem(PREFIJO + clave, JSON.stringify(valor));
    } catch {
        // almacenamiento no disponible
    }
}

export function eliminar(clave) {
    try {
        localStorage.removeItem(PREFIJO + clave);
    } catch {
        // almacenamiento no disponible
    }
}
