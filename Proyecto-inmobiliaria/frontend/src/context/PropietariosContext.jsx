import { createContext, useContext, useEffect, useState } from 'react';
import { propietariosSemilla } from '../data/propietarios';
import { guardar, leer } from '../services/storage';

/**
 * CRUD de propietarios (dueños de inmuebles) con persistencia local.
 * `usuarioId` permite filtrar el catálogo cuando entra un rol
 * propietario con cuenta vinculada.
 */
const PropietariosContext = createContext(null);

export function PropietariosProvider({ children }) {
    const [propietarios, setPropietarios] = useState(() => {
        const guardados = leer('propietarios', null);
        if (guardados) {
            return guardados;
        }
        guardar('propietarios', propietariosSemilla);
        return propietariosSemilla;
    });

    useEffect(() => {
        guardar('propietarios', propietarios);
    }, [propietarios]);

    /** @param {string|number} id */
    const obtener = (id) => propietarios.find((item) => item.id === Number(id));

    /** @param {object} datos - nombre, email, telefono?, rut?, estado? @returns {object} */
    const crear = (datos) => {
        const id = propietarios.reduce((max, item) => Math.max(max, item.id), 0) + 1;
        const nuevo = { id, estado: 'Activo', usuarioId: null, ...datos };
        setPropietarios((prev) => [...prev, nuevo]);
        return nuevo;
    };

    /** @param {string|number} id @param {object} datos */
    const actualizar = (id, datos) => {
        setPropietarios((prev) =>
            prev.map((item) => (item.id === Number(id) ? { ...item, ...datos } : item))
        );
    };

    /** @param {string|number} id */
    const eliminar = (id) => {
        setPropietarios((prev) => prev.filter((item) => item.id !== Number(id)));
    };

    return (
        <PropietariosContext.Provider value={{ propietarios, obtener, crear, actualizar, eliminar }}>
            {children}
        </PropietariosContext.Provider>
    );
}

export function usePropietarios() {
    return useContext(PropietariosContext);
}
