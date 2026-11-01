import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, resultado } from '../services/api';
import { useAuth } from './AuthContext';

/**
 * Catálogo desde la API (/api/propiedades). El backend decide qué ve cada
 * uno (público, dueño, internos) y agrega a cada propiedad `puedeEditar` y
 * `transiciones` para saber qué acciones mostrar. Las operaciones recargan
 * la lista y devuelven { ok, mensaje, datos }.
 */
const PropiedadesContext = createContext(null);

export function PropiedadesProvider({ children }) {
    const { user } = useAuth();
    const [propiedades, setPropiedades] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');

    const recargar = useCallback(async () => {
        try {
            setPropiedades(await api('/api/propiedades'));
            setError('');
        } catch (e) {
            setError(e.message);
        } finally {
            setCargando(false);
        }
    }, []);

    // Lo visible depende de la sesión: recarga al iniciar o cerrar sesión.
    useEffect(() => {
        recargar();
    }, [recargar, user?.id]);

    /** Ejecuta una llamada y, si sale bien, recarga el catálogo. */
    const operar = async (promesa) => {
        const r = await resultado(promesa);
        if (r.ok) await recargar();
        return r;
    };

    /** @param {string|number} id */
    const obtener = (id) => propiedades.find((item) => item.id === Number(id));

    /** @param {object} datos - Payload de PropiedadForm. */
    const crear = (datos) => operar(api('/api/propiedades', { method: 'POST', body: datos }));

    /** @param {string|number} id @param {object} datos */
    const actualizar = (id, datos) =>
        operar(api(`/api/propiedades/${id}`, { method: 'PATCH', body: datos }));

    /** @param {string|number} id @param {string} estado - Destino permitido (§5.1). */
    const cambiarEstado = (id, estado) =>
        operar(api(`/api/propiedades/${id}/estado`, { method: 'POST', body: { estado } }));

    /** Borrado físico (solo admin, sin historial). @param {string|number} id */
    const eliminar = (id) => operar(api(`/api/propiedades/${id}`, { method: 'DELETE' }));

    return (
        <PropiedadesContext.Provider
            value={{ propiedades, cargando, error, recargar, obtener, crear, actualizar, cambiarEstado, eliminar }}
        >
            {children}
        </PropiedadesContext.Provider>
    );
}

export function usePropiedades() {
    return useContext(PropiedadesContext);
}
