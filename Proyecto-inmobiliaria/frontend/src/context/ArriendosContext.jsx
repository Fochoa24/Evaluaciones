import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, resultado } from '../services/api';
import { useAuth } from './AuthContext';

/**
 * Solicitudes de arriendo desde la API (/api/arriendos). El backend filtra
 * por rol (§8), aplica la doble aprobación (§5.3) y agrega a cada solicitud
 * sus `transiciones`. Las operaciones recargan la lista y devuelven
 * { ok, mensaje, datos }.
 */
const ArriendosContext = createContext(null);

export function ArriendosProvider({ children }) {
    const { user } = useAuth();
    const [arriendos, setArriendos] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');

    const recargar = useCallback(async () => {
        if (!user || user.estado !== 'Activo' || user.debeCambiarPassword) {
            setArriendos([]);
            return;
        }
        setCargando(true);
        try {
            setArriendos(await api('/api/arriendos'));
            setError('');
        } catch (e) {
            setError(e.message);
        } finally {
            setCargando(false);
        }
    }, [user]);

    useEffect(() => {
        recargar();
    }, [recargar]);

    const operar = async (promesa) => {
        const r = await resultado(promesa);
        if (r.ok) await recargar();
        return r;
    };

    /** Solo clientes. @param {{propiedadId: number, ingresoMensual: number, garantia?: string, antecedentes?: string, telefono?: string}} datos */
    const crear = (datos) => operar(api('/api/arriendos', { method: 'POST', body: datos }));

    /**
     * @param {number} id @param {string} estado - Uno de `transiciones`.
     * @param {{motivo?: string, observaciones?: string, motivoPropietario?: string}} [extras]
     */
    const cambiarEstado = (id, estado, extras = {}) =>
        operar(api(`/api/arriendos/${id}/estado`, { method: 'POST', body: { estado, ...extras } }));

    /** Solo admin. @param {number} id */
    const eliminar = (id) => operar(api(`/api/arriendos/${id}`, { method: 'DELETE' }));

    return (
        <ArriendosContext.Provider value={{ arriendos, cargando, error, recargar, crear, cambiarEstado, eliminar }}>
            {children}
        </ArriendosContext.Provider>
    );
}

export function useArriendos() {
    return useContext(ArriendosContext);
}
