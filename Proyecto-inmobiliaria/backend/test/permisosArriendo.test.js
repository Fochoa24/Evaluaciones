const test = require('node:test');
const assert = require('node:assert/strict');
const { transicionesArriendo } = require('../utils/permisosArriendo');
const { sumarDiasHabilesFecha } = require('../utils/agenda');

const u = (id, rol, estado = 'Activo') => ({ id, rol, estado });
const propiedad = { id: 1, ejecutivoId: 2, propietarioId: 3 };
const solicitud = (estado) => ({ estado, clienteId: 4, propiedadId: 1 });
const [admin, ejecutivo, otroEjecutivo, dueno, cliente, otroCliente] =
    [u(1, 'admin'), u(2, 'ejecutivo'), u(5, 'ejecutivo'), u(3, 'propietario'), u(4, 'cliente'), u(11, 'cliente')];
const t = (estado, usuario) => transicionesArriendo(solicitud(estado), propiedad, usuario);

test('primera aprobación: ejecutivo responsable o admin (D8)', () => {
    assert.deepEqual(t('Pendiente', ejecutivo), ['En evaluación', 'Esperando propietario', 'Rechazada', 'Cancelada']);
    assert.deepEqual(t('Pendiente', admin), t('Pendiente', ejecutivo));
    assert.deepEqual(t('Pendiente', otroEjecutivo), []);
    assert.deepEqual(t('Pendiente', dueno), []);
});

test('segunda aprobación: solo el dueño (RN-10)', () => {
    assert.deepEqual(t('Esperando propietario', dueno), ['Aprobada', 'Rechazada']);
    assert.deepEqual(t('Esperando propietario', ejecutivo), ['Cancelada']);
    assert.deepEqual(t('Esperando propietario', u(3, 'propietario', 'Inactivo')), []);
});

test('cliente: cancela la suya, reactiva una Vencida, no desiste de una Aprobada', () => {
    assert.deepEqual(t('Pendiente', cliente), ['Cancelada']);
    assert.deepEqual(t('Vencida', cliente), ['Pendiente', 'Cancelada']);
    assert.deepEqual(t('Aprobada', cliente), []);
    assert.deepEqual(t('Pendiente', otroCliente), []);
    assert.deepEqual(t('Aprobada', ejecutivo), ['Cancelada']);
    assert.deepEqual(t('Finalizada', admin), []);
});

test('vencimiento a 5 días hábiles, misma hora (RN-19)', () => {
    // Miércoles 2 de diciembre 2026, 15:00 en Chile (UTC-3) → miércoles 9 (el 8 es feriado).
    const desde = new Date('2026-12-02T18:00:00Z');
    assert.equal(sumarDiasHabilesFecha(desde, 5).toISOString(), '2026-12-10T18:00:00.000Z');
});
