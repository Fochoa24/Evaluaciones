import { createContext, useContext, useEffect, useState } from 'react';
import { guardar, leer } from '../services/storage';

const VisitasContext = createContext(null);

export function VisitasProvider({ children }) {
    const [visitas, setVisitas] = useState(() => leer('visitas', []));

    useEffect(() => {
        guardar('visitas', visitas);
    }, [visitas]);

    const crear = (datos) => {
        const id = visitas.reduce((max, item) => Math.max(max, item.id), 0) + 1;
        const nueva = {
            id,
            estado: 'Pendiente',
            creadaEn: new Date().toISOString(),
            ...datos
        };
        setVisitas((prev) => [nueva, ...prev]);
        return nueva;
    };

    const actualizarEstado = (id, estado) => {
        setVisitas((prev) => prev.map((item) => (item.id === Number(id) ? { ...item, estado } : item)));
    };

    const eliminar = (id) => {
        setVisitas((prev) => prev.filter((item) => item.id !== Number(id)));
    };

    return (
        <VisitasContext.Provider value={{ visitas, crear, actualizarEstado, eliminar }}>
            {children}
        </VisitasContext.Provider>
    );
}

export function useVisitas() {
    return useContext(VisitasContext);
}
