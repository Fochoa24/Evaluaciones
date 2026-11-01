import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, resultado } from '../services/api';
import { useAuth } from './AuthContext';

/**
 * Visitas desde la API (/api/visitas). El backend filtra por rol (§8),
 * valida la agenda (RN-01 a RN-05) y agrega a cada visita `transiciones` y
 * `puedeReprogramar`. Las operaciones recargan la lista y devuelven
 * { ok, mensaje, datos }.
 */
const VisitasContext = createContext(null);

export function VisitasProvider({ children }) {
    const { user } = useAuth();
    const [visitas, setVisitas] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');

    // Sin sesión no hay lista que ver (agendar sí se puede).
    const recargar = useCallback(async () => {
        if (!user || user.estado !== 'Activo' || user.debeCambiarPassword) {
            setVisitas([]);
            return;
        }
        setCargando(true);
        try {
            setVisitas(await api('/api/visitas'));
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

    /** @param {object} datos - propiedadId, nombre, email, telefono, fecha, hora, comentarios. */
    const crear = (datos) => operar(api('/api/visitas', { method: 'POST', body: datos }));

    /** @param {number} id @param {{fecha: string, hora: string}} horario */
    const reprogramar = (id, horario) =>
        operar(api(`/api/visitas/${id}`, { method: 'PATCH', body: horario }));

    /** @param {number} id @param {string} estado @param {string} [resultadoVisita] - Para Realizada. */
    const cambiarEstado = (id, estado, resultadoVisita) =>
        operar(api(`/api/visitas/${id}/estado`, { method: 'POST', body: { estado, resultado: resultadoVisita } }));

    /** Solo admin. @param {number} id */
    const eliminar = (id) => operar(api(`/api/visitas/${id}`, { method: 'DELETE' }));

    /**
     * Rango agendable y bloques libres del día (sin fecha: solo el rango).
     * @returns {Promise<{ok: boolean, mensaje: string, datos?: {desde: string, hasta: string, bloques: string[]}}>}
     */
    const horarios = (propiedadId, fecha = '') =>
        resultado(api(`/api/propiedades/${propiedadId}/horarios${fecha ? `?fecha=${fecha}` : ''}`));

    return (
        <VisitasContext.Provider
            value={{ visitas, cargando, error, recargar, crear, reprogramar, cambiarEstado, eliminar, horarios }}
        >
            {children}
        </VisitasContext.Provider>
    );
}

export function useVisitas() {
    return useContext(VisitasContext);
}
