/**
 * Visitas de ejemplo para la demo (RF7).
 * Estados cubiertos: Pendiente, Confirmada, Rechazada, Realizada.
 */
export const visitasSemilla = [
    {
        id: 1,
        propiedadId: 1,
        propiedadTitulo: 'Departamento Amueblado en Av. Italia',
        nombre: 'Cliente Demo',
        email: 'cliente@inmobiliaria.cl',
        telefono: '+56 9 1111 2222',
        fecha: '2026-09-28',
        hora: '11:00',
        comentarios: 'Prefiere visita en la mañana.',
        estado: 'Confirmada',
        resultado: '',
        ejecutivoId: 2,
        creadaEn: '2026-09-20T09:00:00.000Z'
    },
    {
        id: 2,
        propiedadId: 4,
        propiedadTitulo: 'Local Comercial a Pie de Calle',
        nombre: 'Andrés Pizarro',
        email: 'andres.pizarro@email.com',
        telefono: '+56 9 3333 4444',
        fecha: '2026-09-25',
        hora: '16:30',
        comentarios: '',
        estado: 'Pendiente',
        resultado: '',
        ejecutivoId: null,
        creadaEn: '2026-09-22T18:00:00.000Z'
    },
    {
        id: 3,
        propiedadId: 5,
        propiedadTitulo: 'Departamento con Vista al Cerro',
        nombre: 'Lucía Herrera',
        email: 'lucia.herrera@email.com',
        telefono: '+56 9 2222 3333',
        fecha: '2026-09-18',
        hora: '10:00',
        comentarios: 'Lleva a su pareja a ver el departamento.',
        estado: 'Realizada',
        resultado: 'Interesado en arrendar',
        ejecutivoId: 2,
        creadaEn: '2026-09-10T12:00:00.000Z'
    },
    {
        id: 4,
        propiedadId: 2,
        propiedadTitulo: 'Casa Familiar con Jardín y Piscina',
        nombre: 'Pedro Salas',
        email: 'pedro.salas@email.com',
        telefono: '+56 9 4444 5555',
        fecha: '2026-09-15',
        hora: '15:00',
        comentarios: '',
        estado: 'Rechazada',
        resultado: 'No le interesó',
        ejecutivoId: 2,
        creadaEn: '2026-09-08T09:30:00.000Z'
    },
    {
        id: 5,
        propiedadId: 11,
        propiedadTitulo: 'Oficina Vitrina en Providencia',
        nombre: 'Empresa Nova SpA',
        email: 'rrhh@empresanova.cl',
        telefono: '+56 2 2111 4444',
        fecha: '2026-10-02',
        hora: '09:30',
        comentarios: 'Requiere visita técnica del espacio.',
        estado: 'Pendiente',
        resultado: '',
        ejecutivoId: null,
        creadaEn: '2026-09-23T08:00:00.000Z'
    },
    {
        id: 6,
        propiedadId: 9,
        propiedadTitulo: 'Departamento Familiar en Maipú',
        nombre: 'Camila Rojas',
        email: 'camila.rojas@email.com',
        telefono: '+56 9 6666 7777',
        fecha: '2026-09-30',
        hora: '17:00',
        comentarios: 'Pide confirmar si hay gastos comunes incluidos.',
        estado: 'Cancelada',
        resultado: 'Reprogramará',
        ejecutivoId: null,
        creadaEn: '2026-09-21T14:00:00.000Z'
    }
];
