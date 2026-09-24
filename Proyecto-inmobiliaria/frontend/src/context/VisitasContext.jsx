import { createContext, useContext, useEffect, useState } from 'react';
import { visitasSemilla } from '../data/visitas';
import { guardar, leer } from '../services/storage';

/**
 * Agenda de visitas (RF7–RF8): estados, resultado post-visita y
 * detección de superposiciones de fecha+hora en la agenda.
 */
const VisitasContext = createContext(null);

export function VisitasProvider({ children }) {
    const [visitas, setVisitas] = useState(() => {
        const guardados = leer('visitas', null);
        if (guardados) {
            return guardados;
        }
        guardar('visitas', visitasSemilla);
        return visitasSemilla;
    });

    useEffect(() => {
        guardar('visitas', visitas);
    }, [visitas]);

    /**
     * Indica si otra visita activa ocupa el mismo día y hora.
     * @param {{fecha: string, hora: string, excluirId?: number}} criterio
     * @returns {boolean}
     */
    const hayConflicto = ({ fecha, hora, excluirId = null }) => {
        return visitas.some(
            (item) =>
                item.id !== Number(excluirId) &&
                item.fecha === fecha &&
                item.hora === hora &&
                ['Pendiente', 'Confirmada'].includes(item.estado)
        );
    };

    /**
     * Crea una solicitud si no hay conflicto de agenda.
     * @param {object} datos - propiedadId, nombre, email, fecha, hora, ...
     * @returns {{ok: boolean, mensaje: string, visita?: object}}
     */
    const crear = (datos) => {
        if (hayConflicto(datos)) {
            return {
                ok: false,
                mensaje: `Ya existe una visita programada el ${datos.fecha} a las ${datos.hora}. Elige otro horario.`
            };
        }

        const id = visitas.reduce((max, item) => Math.max(max, item.id), 0) + 1;
        const nueva = {
            id,
            estado: 'Pendiente',
            resultado: '',
            ejecutivoId: null,
            creadaEn: new Date().toISOString(),
            ...datos
        };
        setVisitas((prev) => [nueva, ...prev]);
        return { ok: true, visita: nueva, mensaje: 'Solicitud de visita registrada.' };
    };

    /**
     * Actualiza campos de una visita (reprogramar, resultado, ...).
     * Valida conflicto si cambian fecha y hora.
     * @param {string|number} id @param {object} datos
     * @returns {{ok: boolean, mensaje: string}}
     */
    const actualizar = (id, datos) => {
        if (datos.fecha && datos.hora) {
            if (hayConflicto({ ...datos, excluirId: id })) {
                return {
                    ok: false,
                    mensaje: 'Hay conflicto de horario con otra visita en esa fecha y hora.'
                };
            }
        }
        setVisitas((prev) =>
            prev.map((item) => (item.id === Number(id) ? { ...item, ...datos } : item))
        );
        return { ok: true, mensaje: 'Visita actualizada.' };
    };

    /**
     * Cambia el estado del flujo y/o guarda el resultado.
     * @param {string|number} id @param {string} estado @param {object} [extras]
     */
    const actualizarEstado = (id, estado, extras = {}) => {
        setVisitas((prev) =>
            prev.map((item) => (item.id === Number(id) ? { ...item, estado, ...extras } : item))
        );
    };

    /** @param {string|number} id */
    const eliminar = (id) => {
        setVisitas((prev) => prev.filter((item) => item.id !== Number(id)));
    };

    return (
        <VisitasContext.Provider
            value={{ visitas, crear, actualizar, actualizarEstado, eliminar, hayConflicto }}
        >
            {children}
        </VisitasContext.Provider>
    );
}

export function useVisitas() {
    return useContext(VisitasContext);
}
