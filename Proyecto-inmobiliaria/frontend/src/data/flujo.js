export const ESTADOS_VISITA = ['Pendiente', 'Confirmada', 'Rechazada', 'Cancelada', 'Realizada'];

/** RN-01: inicios de 30 min de 09:00 a 17:30 (copia de BLOQUES en backend/utils/agenda.js). */
export const HORAS_VISITA = Array.from({ length: 18 }, (_, i) =>
    `${String(9 + Math.floor(i / 2)).padStart(2, '0')}:${i % 2 ? '30' : '00'}`
);

export const RESULTADOS_VISITA = [
    '',
    'Interesado en arrendar',
    'Pedirá antecedentes',
    'No le interesó',
    'Reprogramará'
];

/** §5.3 (copia de backend/config/constantes.js). */
export const ESTADOS_ARRIENDO = [
    'Pendiente',
    'En evaluación',
    'Esperando propietario',
    'Aprobada',
    'Rechazada',
    'Vencida',
    'Cancelada',
    'Finalizada'
];

export const MOTIVOS_ARRIENDO = [
    '',
    'Estabilidad laboral comprobada',
    'Sin antecedentes de deuda',
    'Requiere fianza',
    'Ingreso insuficiente',
    'Datos incompletos',
    'Propiedad reservada para otro postulante'
];
