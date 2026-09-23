import { createContext, useContext, useEffect, useState } from 'react';
import { propiedades as propiedadesSemilla } from '../data/propiedades';
import { guardar, leer } from '../services/storage';

const PropiedadesContext = createContext(null);

export function PropiedadesProvider({ children }) {
    const [propiedades, setPropiedades] = useState(() => {
        const guardadas = leer('propiedades', null);
        if (guardadas) {
            return guardadas;
        }
        guardar('propiedades', propiedadesSemilla);
        return propiedadesSemilla;
    });

    useEffect(() => {
        guardar('propiedades', propiedades);
    }, [propiedades]);

    const obtener = (id) => propiedades.find((item) => item.id === Number(id));

    const crear = (datos) => {
        const id = propiedades.reduce((max, item) => Math.max(max, item.id), 0) + 1;
        const nueva = { id, ...datos };
        setPropiedades((prev) => [...prev, nueva]);
        return nueva;
    };

    const actualizar = (id, datos) => {
        setPropiedades((prev) =>
            prev.map((item) => (item.id === Number(id) ? { ...item, ...datos } : item))
        );
    };

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
