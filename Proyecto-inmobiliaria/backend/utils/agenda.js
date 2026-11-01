const { AGENDA, FERIADOS, ESTADOS_VISITA_ACTIVOS, DIAS_AGENDA } = require('../config/constantes');

/**
 * Reglas de agenda de visitas (RN-01 a RN-05, §5.2). Funciones puras sobre
 * fechas 'YYYY-MM-DD' y horas 'HH:mm' en hora de Chile; las rutas les pasan
 * las visitas activas del día y el momento actual.
 */

const ZONA = 'America/Santiago';

/** @returns {{fecha: string, hora: string}} Momento actual en Chile. */
function ahoraChile(fecha = new Date()) {
    return {
        fecha: fecha.toLocaleDateString('en-CA', { timeZone: ZONA }),
        hora: fecha.toLocaleTimeString('en-GB', { timeZone: ZONA, hour: '2-digit', minute: '2-digit' })
    };
}

const minutos = (hora) => Number(hora.slice(0, 2)) * 60 + Number(hora.slice(3));
const aHora = (min) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;

/** Inicios válidos: '09:00' … '17:30'. */
const BLOQUES = [];
for (let m = minutos(AGENDA.inicio); m + AGENDA.duracionMin <= minutos(AGENDA.fin); m += AGENDA.duracionMin) {
    BLOQUES.push(aHora(m));
}

const sumarDias = (fecha, dias) => {
    const d = new Date(`${fecha}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + dias);
    return d.toISOString().slice(0, 10);
};

/** Lunes a viernes y no feriado. */
function esDiaHabil(fecha) {
    const dia = new Date(`${fecha}T00:00:00Z`).getUTCDay();
    return dia >= 1 && dia <= 5 && !FERIADOS.has(fecha);
}

/** Fecha `n` días hábiles después de `fecha`. */
function sumarDiasHabiles(fecha, n) {
    let actual = fecha;
    while (n > 0) {
        actual = sumarDias(actual, 1);
        if (esDiaHabil(actual)) n--;
    }
    return actual;
}

/**
 * RN-19: el mismo instante, `n` días hábiles (en Chile) después de `desde`.
 * @param {Date} desde @param {number} n @returns {Date}
 */
function sumarDiasHabilesFecha(desde, n) {
    const hoy = ahoraChile(desde).fecha;
    const dias = (Date.parse(sumarDiasHabiles(hoy, n)) - Date.parse(hoy)) / 86400000;
    return new Date(desde.getTime() + dias * 86400000);
}

/**
 * Fechas agendables: el público desde el día hábil siguiente; los internos
 * (que confirman ellos mismos) desde hoy. Hasta DIAS_AGENDA días corridos.
 */
function rangoAgenda(hoy, interno = false) {
    return { desde: interno ? hoy : sumarDiasHabiles(hoy, 1), hasta: sumarDias(hoy, DIAS_AGENDA) };
}

/**
 * RN-01 y plazos. @returns {string|null} Motivo del rechazo, o null si sirve.
 * @param {{interno?: boolean, ahora: {fecha: string, hora: string}}} opciones
 */
function validarHorario(fecha, hora, { interno = false, ahora }) {
    // Ida y vuelta: descarta fechas como 2026-02-30, que Date acepta.
    const formato = /^\d{4}-\d{2}-\d{2}$/.test(fecha || '') && !Number.isNaN(Date.parse(fecha));
    if (!formato || sumarDias(fecha, 0) !== fecha) {
        return 'La fecha no es válida.';
    }
    if (!BLOQUES.includes(hora)) {
        return `La hora debe ser un bloque de ${AGENDA.duracionMin} min entre ${BLOQUES[0]} y ${BLOQUES.at(-1)}.`;
    }
    if (!esDiaHabil(fecha)) {
        return 'Las visitas son de lunes a viernes, excepto feriados.';
    }
    const { desde, hasta } = rangoAgenda(ahora.fecha, interno);
    if (fecha < desde || fecha > hasta) {
        return `Elige una fecha entre el ${desde} y el ${hasta}.`;
    }
    if (fecha === ahora.fecha && hora <= ahora.hora) {
        return 'Ese horario ya pasó.';
    }
    return null;
}

/**
 * RN-03 y RN-04: primera visita activa de `otras` que choca con `visita`.
 * Misma propiedad: 30 min entre inicios. Mismo ejecutivo en otra propiedad:
 * 30 de visita + 30 de traslado.
 * @param {{id?: number, propiedadId: number, ejecutivoId: number, fecha: string, hora: string}} visita
 * @param {object[]} otras - Visitas del mismo día (la propia se ignora por id).
 * @returns {object|undefined}
 */
function buscarChoque(visita, otras) {
    return otras.find((o) => {
        if (o.id === visita.id || o.fecha !== visita.fecha || !ESTADOS_VISITA_ACTIVOS.includes(o.estado)) {
            return false;
        }
        const distancia = Math.abs(minutos(o.hora) - minutos(visita.hora));
        if (o.propiedadId === visita.propiedadId) return distancia < AGENDA.duracionMin;
        if (o.ejecutivoId === visita.ejecutivoId) return distancia < AGENDA.duracionMin + AGENDA.trasladoMin;
        return false;
    });
}

/** Bloques del día en que `visita` (sin hora) no choca con `otras`. */
const bloquesLibres = (visita, otras) => BLOQUES.filter((hora) => !buscarChoque({ ...visita, hora }, otras));

/** true si la visita ya empezó (se puede cerrar como Realizada). */
const yaOcurrio = (visita, ahora) =>
    visita.fecha < ahora.fecha || (visita.fecha === ahora.fecha && visita.hora <= ahora.hora);

/**
 * §5.2: estados a los que `usuario` puede llevar la visita. El ejecutivo
 * asignado o el admin gestionan; el cliente solo cancela las suyas; el
 * propietario solo mira.
 * @returns {string[]}
 */
function transicionesVisita(visita, usuario) {
    const gestiona = usuario.rol === 'admin' || (usuario.rol === 'ejecutivo' && visita.ejecutivoId === usuario.id);
    const propia = usuario.rol === 'cliente' && visita.clienteId === usuario.id;
    const destinos = [];
    if (gestiona && visita.estado === 'Pendiente') destinos.push('Confirmada', 'Rechazada');
    if (gestiona && visita.estado === 'Confirmada') destinos.push('Realizada');
    if ((gestiona || propia) && ESTADOS_VISITA_ACTIVOS.includes(visita.estado)) destinos.push('Cancelada');
    return destinos;
}

module.exports = {
    BLOQUES,
    ahoraChile,
    sumarDiasHabiles,
    sumarDiasHabilesFecha,
    rangoAgenda,
    validarHorario,
    buscarChoque,
    bloquesLibres,
    yaOcurrio,
    transicionesVisita
};
