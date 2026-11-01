/**
 * Constantes del catálogo. Los datos viven en la API; la semilla está en
 * backend/data/semilla.js. Copia de backend/config/constantes.js: cambiar ambos.
 */

/** Imagen de respaldo al renderizar cuando la propiedad no tiene URL (F26). */
export const IMAGEN_DEFECTO =
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80';

/** Tipos de inmueble soportados por el formulario y los filtros. */
export const TIPOS_PROPIEDAD = ['Departamento', 'Casa', 'Oficina', 'Local comercial'];

/** Mapa clave del filtro (slug) → valor del catálogo. */
export const tipoMap = {
    departamento: 'Departamento',
    casa: 'Casa',
    oficina: 'Oficina',
    local: 'Local comercial'
};

/**
 * Texto del botón para llevar una propiedad de `origen` a `destino`.
 * Las transiciones permitidas las decide el backend (`propiedad.transiciones`).
 * @returns {string}
 */
export function etiquetaTransicion(origen, destino) {
    if (destino === 'Publicada') return origen === 'Reservada' ? 'Liberar reserva' : 'Publicar';
    if (destino === 'Disponible') {
        return {
            Publicada: 'Despublicar',
            Arrendada: 'Fin de contrato',
            Inactiva: 'Reactivar',
            'En mantención': 'Terminar mantención'
        }[origen];
    }
    return {
        Reservada: 'Reservar',
        Arrendada: 'Marcar arrendada',
        'En mantención': 'Enviar a mantención',
        Inactiva: 'Dar de baja'
    }[destino];
}

/** Confirmaciones de transiciones con efectos sobre otros registros (§7). */
export const CONFIRMAR_TRANSICION = {
    Inactiva: 'Se cancelarán sus visitas y solicitudes abiertas, y saldrá del catálogo.',
    'Arrendada→Disponible': 'La solicitud aprobada quedará Finalizada y la propiedad volverá a revisión.',
    'Reservada→Publicada': 'La solicitud aprobada quedará Cancelada.'
};
