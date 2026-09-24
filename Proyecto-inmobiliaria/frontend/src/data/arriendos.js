/**
 * Solicitudes de arriendo ficticias (RF9–RF11).
 * Cubren Pendiente, En evaluación, Aprobada (reserva) y Rechazada.
 * Sirven solo para demostrar el flujo de evaluación del caso.
 */
export const arriendosSemilla = [
    {
        id: 1,
        propiedadId: 1,
        propiedadTitulo: 'Departamento Amueblado en Av. Italia',
        clienteNombre: 'Cliente Demo',
        clienteEmail: 'cliente@inmobiliaria.cl',
        clienteTelefono: '+56 9 1111 2222',
        ingresoMensual: 1800000,
        garantia: 'Depósito 1 mes',
        antecedentes: 'Contrato indefinido, sin deudas vigentes.',
        estado: 'Pendiente',
        observacionesEjecutivo: '',
        motivo: '',
        creadaEn: '2026-09-10T10:00:00.000Z',
        evaluadaEn: null
    },
    {
        id: 2,
        propiedadId: 2,
        propiedadTitulo: 'Casa Familiar con Jardín y Piscina',
        clienteNombre: 'Andrés Pizarro',
        clienteEmail: 'andres.pizarro@email.com',
        clienteTelefono: '+56 9 3333 4444',
        ingresoMensual: 2500000,
        garantia: 'Carta de aval',
        antecedentes: 'Arrendatario anterior sin incidencias.',
        estado: 'En evaluación',
        observacionesEjecutivo: 'Validando referencias laborales.',
        motivo: '',
        creadaEn: '2026-09-12T15:30:00.000Z',
        evaluadaEn: null
    },
    {
        id: 3,
        propiedadId: 4,
        propiedadTitulo: 'Local Comercial a Pie de Calle',
        clienteNombre: 'Comercial Andes Ltda.',
        clienteEmail: 'gerencia@comercialandes.cl',
        clienteTelefono: '+56 2 2555 6666',
        ingresoMensual: 4000000,
        garantia: 'Fianza bancaria',
        antecedentes: 'Empresa con 8 años de operación.',
        estado: 'Aprobada',
        observacionesEjecutivo: 'Aprobada. Propiedad reservada.',
        motivo: 'Estabilidad laboral comprobada',
        creadaEn: '2026-09-05T11:00:00.000Z',
        evaluadaEn: '2026-09-07T09:00:00.000Z'
    },
    {
        id: 4,
        propiedadId: 7,
        propiedadTitulo: 'Studio Céntrico Cerro Santa Lucía',
        clienteNombre: 'Diego Muñoz',
        clienteEmail: 'diego.munoz@email.com',
        clienteTelefono: '+56 9 8888 9999',
        ingresoMensual: 900000,
        garantia: 'Depósito 1 mes',
        antecedentes: 'Ingresos eventuales, sin contrato fijo.',
        estado: 'Rechazada',
        observacionesEjecutivo: 'Ingreso insuficiente para el arriendo solicitado.',
        motivo: 'Ingreso insuficiente',
        creadaEn: '2026-09-01T16:00:00.000Z',
        evaluadaEn: '2026-09-03T10:00:00.000Z'
    },
    {
        id: 5,
        propiedadId: 12,
        propiedadTitulo: 'Departamento Playa en Viña (sucursal)',
        clienteNombre: 'Fernanda Castillo',
        clienteEmail: 'fernanda.castillo@email.com',
        clienteTelefono: '+56 9 1212 3434',
        ingresoMensual: 2200000,
        garantia: 'Aval con contrato indefinido',
        antecedentes: 'Busca arriendo por 24 meses.',
        estado: 'Pendiente',
        observacionesEjecutivo: '',
        motivo: '',
        creadaEn: '2026-09-23T19:00:00.000Z',
        evaluadaEn: null
    }
];
