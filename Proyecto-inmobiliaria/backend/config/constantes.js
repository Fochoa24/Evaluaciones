/**
 * Fuente de verdad de roles, estados y parámetros de negocio
 * (docs/modelo-logico.md). El frontend mantiene una copia en
 * src/data/roles.js, flujo.js y propiedades.js: cambiar ambos.
 */

const ROLES = ['admin', 'ejecutivo', 'propietario', 'cliente'];
/** §8: propietarios, clientes, publicar, 1ª aprobación (por cartera). */
const ROLES_INTERNOS = ['admin', 'ejecutivo'];
/** §8: crear/editar propiedades (por propiedad o cartera). */
const ROLES_GESTION = ['admin', 'ejecutivo', 'propietario'];
/** §8: usuarios internos, reasignar, borrado físico. */
const ROLES_ADMIN = ['admin'];
/** D2/D14: autorregistro; ambos quedan Pendiente. */
const ROLES_REGISTRO = ['cliente', 'propietario'];

const ESTADOS_CUENTA = ['Pendiente', 'Activo', 'Inactivo'];

const TIPOS_PROPIEDAD = ['Departamento', 'Casa', 'Oficina', 'Local comercial'];
const ESTADOS_PROPIEDAD = ['Disponible', 'Publicada', 'Reservada', 'Arrendada', 'En mantención', 'Inactiva'];
/** D9: visibles en el catálogo público. */
const ESTADOS_PUBLICOS = ['Publicada', 'Reservada'];

const ESTADOS_VISITA = ['Pendiente', 'Confirmada', 'Rechazada', 'Cancelada', 'Realizada'];
/** RN-03/04: ocupan agenda. */
const ESTADOS_VISITA_ACTIVOS = ['Pendiente', 'Confirmada'];
const RESULTADOS_VISITA = ['', 'Interesado en arrendar', 'Pedirá antecedentes', 'No le interesó', 'Reprogramará'];

const ESTADOS_ARRIENDO = [
    'Pendiente',
    'En evaluación',
    'Esperando propietario',
    'Aprobada',
    'Rechazada',
    'Vencida',
    'Cancelada',
    // Contrato cumplido: la propiedad pasó de Arrendada a Disponible.
    'Finalizada'
];
/** RN-07: cuentan como solicitud abierta del cliente. */
const ESTADOS_ARRIENDO_ACTIVOS = ['Pendiente', 'En evaluación', 'Esperando propietario'];
/** Una baja cancela las abiertas y las vencidas (que se podrían reactivar). */
const ESTADOS_ARRIENDO_NO_FINALIZADOS = [...ESTADOS_ARRIENDO_ACTIVOS, 'Vencida'];
/** Llevan la aprobación del ejecutivo responsable (RN-17). */
const ESTADOS_ARRIENDO_CON_APROBACION = ['En evaluación', 'Esperando propietario', 'Vencida'];
const MOTIVOS_ARRIENDO = [
    '',
    'Estabilidad laboral comprobada',
    'Sin antecedentes de deuda',
    'Requiere fianza',
    'Ingreso insuficiente',
    'Datos incompletos',
    // Fase 6: el dueño aprobó otra solicitud de la misma propiedad.
    'Propiedad reservada para otro postulante'
];

/** RN-01: bloques de 30 min, L–V 09:00–18:00 (último inicio 17:30), sin feriados. */
const AGENDA = { duracionMin: 30, trasladoMin: 30, inicio: '09:00', fin: '18:00' };
/** Se agenda desde el día hábil siguiente hasta 30 días corridos (fase 5). */
const DIAS_AGENDA = 30;
/** D15: plazo de respuesta del propietario. */
const PLAZO_PROPIETARIO_DIAS_HABILES = 5;
/** D16: cuentas sin correo confirmado se eliminan (TTL). */
const DIAS_CUENTA_SIN_ACTIVAR = 14;

/**
 * Feriados nacionales de Chile (YYYY-MM-DD) que caen en día hábil o fin de semana.
 * Se excluyen de la agenda (RN-01) y del cómputo de días hábiles (RN-19).
 * ponytail: lista fija; actualizar cada año contra feriados.cl (incluye elecciones
 * y feriados nuevos por ley). Pasar a una API si se vuelve inmanejable.
 */
const FERIADOS = new Set([
    // 2026
    '2026-01-01', '2026-04-03', '2026-04-04', '2026-05-01', '2026-05-21', '2026-06-21',
    '2026-06-29', '2026-07-16', '2026-08-15', '2026-09-18', '2026-09-19', '2026-10-12',
    '2026-10-31', '2026-11-01', '2026-12-08', '2026-12-25',
    // 2027
    '2027-01-01', '2027-03-26', '2027-03-27', '2027-05-01', '2027-05-21', '2027-06-21',
    '2027-06-28', '2027-07-16', '2027-08-15', '2027-09-18', '2027-09-19', '2027-10-11',
    '2027-10-31', '2027-11-01', '2027-12-08', '2027-12-25'
]);

module.exports = {
    ROLES,
    ROLES_INTERNOS,
    ROLES_GESTION,
    ROLES_ADMIN,
    ROLES_REGISTRO,
    ESTADOS_CUENTA,
    TIPOS_PROPIEDAD,
    ESTADOS_PROPIEDAD,
    ESTADOS_PUBLICOS,
    ESTADOS_VISITA,
    ESTADOS_VISITA_ACTIVOS,
    RESULTADOS_VISITA,
    ESTADOS_ARRIENDO,
    ESTADOS_ARRIENDO_ACTIVOS,
    ESTADOS_ARRIENDO_NO_FINALIZADOS,
    ESTADOS_ARRIENDO_CON_APROBACION,
    MOTIVOS_ARRIENDO,
    AGENDA,
    DIAS_AGENDA,
    PLAZO_PROPIETARIO_DIAS_HABILES,
    DIAS_CUENTA_SIN_ACTIVAR,
    FERIADOS
};
