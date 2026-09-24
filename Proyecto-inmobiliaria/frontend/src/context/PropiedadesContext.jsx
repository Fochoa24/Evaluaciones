import { createContext, useContext, useEffect, useState } from 'react';
import { propiedades as propiedadesSemilla } from '../data/propiedades';
import { guardar, leer } from '../services/storage';

/**
 * Estado global del catálogo de propiedades (CRUD + persistencia).
 * Al montar, migra campos RF3 faltantes en datos antiguos de
 * localStorage (gastos, estacionamientos, características, dueño).
 */
const PropiedadesContext = createContext(null);

/**
 * Completa campos RF3 ausentes en semillas/versiones previas.
 * @param {object[]} lista - Propiedades crudas de storage.
 * @returns {object[]} Lista con defaults aplicados.
 */
function migrarPropiedades(lista) {
    return lista.map((item) => ({
        gastosComunes: 0,
        estacionamientos: 0,
        caracteristicas: [],
        propietarioId: null,
        direccion: '',
        ...item
    }));
}

export function PropiedadesProvider({ children }) {
    const [propiedades, setPropiedades] = useState(() => {
        const guardadas = leer('propiedades', null);
        if (guardadas) {
            const migradas = migrarPropiedades(guardadas);
            if (JSON.stringify(migradas) !== JSON.stringify(guardadas)) {
                guardar('propiedades', migradas);
            }
            return migradas;
        }
        guardar('propiedades', propiedadesSemilla);
        return propiedadesSemilla;
    });

    useEffect(() => {
        guardar('propiedades', propiedades);
    }, [propiedades]);

    /** @param {string|number} id - Id de la propiedad. */
    const obtener = (id) => propiedades.find((item) => item.id === Number(id));

    /** @param {object} datos - Payload del formulario. @returns {object} Nueva propiedad. */
    const crear = (datos) => {
        const id = propiedades.reduce((max, item) => Math.max(max, item.id), 0) + 1;
        const nueva = { id, ...datos };
        setPropiedades((prev) => [...prev, nueva]);
        return nueva;
    };

    /** @param {string|number} id @param {object} datos - Campos a sobreescribir. */
    const actualizar = (id, datos) => {
        setPropiedades((prev) =>
            prev.map((item) => (item.id === Number(id) ? { ...item, ...datos } : item))
        );
    };

    /** @param {string|number} id */
    const eliminar = (id) => {
        setPropiedades((prev) => prev.filter((item) => item.id !== Number(id)));
    };

    return (
        <PropiedadesContext.Provider value={{ propiedades, obtener, crear, actualizar, eliminar }}>
            {children}
        </PropiedadesContext.Provider>
    );
}

export function usePropiedades() {
    return useContext(PropiedadesContext);
}
