import { createContext, useContext, useEffect, useState } from 'react';
import { arriendosSemilla } from '../data/arriendos';
import { guardar, leer } from '../services/storage';

/**
 * Solicitudes de arriendo (RF9–RF11): el cliente envía antecedentes
 * y un evaluador aprueba (reserva la propiedad), rechaza o libera
 * la reserva. Persiste en `gi_arriendos`.
 */
const ArriendosContext = createContext(null);

export function ArriendosProvider({ children }) {
    const [arriendos, setArriendos] = useState(() => {
        const guardados = leer('arriendos', null);
        if (guardados) {
            return guardados;
        }
        guardar('arriendos', arriendosSemilla);
        return arriendosSemilla;
    });

    useEffect(() => {
        guardar('arriendos', arriendos);
    }, [arriendos]);

    /**
     * Registra una nueva solicitud en estado Pendiente.
     * @param {object} datos - propiedadId, clienteNombre, ingresoMensual, ...
     * @returns {object} Solicitud creada.
     */
    const crear = (datos) => {
        const id = siguienteId(arriendos);
        const nueva = {
            id,
            estado: 'Pendiente',
            observacionesEjecutivo: '',
            motivo: '',
            creadaEn: new Date().toISOString(),
            evaluadaEn: null,
            ...datos
        };
        setArriendos((prev) => [nueva, ...prev]);
        return nueva;
    };

    /**
     * Cambia el estado de evaluación y opcionalmente observaciones/motivo.
     * @param {string|number} id @param {string} estado @param {object} [extras]
     */
    const actualizarEstado = (id, estado, extras = {}) => {
        setArriendos((prev) =>
            prev.map((item) =>
                item.id === Number(id)
                    ? {
                          ...item,
                          estado,
                          evaluadaEn: new Date().toISOString(),
                          ...extras
                      }
                    : item
            )
        );
    };

    /** @param {string|number} id */
    const eliminar = (id) => {
        setArriendos((prev) => prev.filter((item) => item.id !== Number(id)));
    };

    return (
        <ArriendosContext.Provider value={{ arriendos, crear, actualizarEstado, eliminar }}>
            {children}
        </ArriendosContext.Provider>
    );
}

/**
 * Siguiente id autoincremental en una lista con campo `id`.
 * @param {Array<{id: number}>} lista
 * @returns {number}
 */
function siguienteId(lista) {
    return lista.reduce((max, item) => Math.max(max, item.id), 0) + 1;
}

export function useArriendos() {
    return useContext(ArriendosContext);
}
