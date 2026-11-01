/**
 * Permisos y transiciones de propiedades (§5.1, §8).
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { puedeVerCompleta, puedeEditar, transicionesPermitidas } = require('../utils/permisosPropiedad');

const propiedad = (estado) => ({ id: 1, estado, propietarioId: 3, ejecutivoId: 2 });
const u = (id, rol, estado = 'Activo') => ({ id, rol, estado });
const admin = u(1, 'admin');
const responsable = u(2, 'ejecutivo');
const otroEjecutivo = u(5, 'ejecutivo');
const dueno = u(3, 'propietario');
const otroDueno = u(7, 'propietario');
const cliente = u(4, 'cliente');

test('dirección y dueño: internos y el dueño; no el público ni otros', () => {
    assert.ok(puedeVerCompleta(propiedad('Publicada'), otroEjecutivo));
    assert.ok(puedeVerCompleta(propiedad('Publicada'), dueno));
    assert.ok(!puedeVerCompleta(propiedad('Publicada'), cliente));
    assert.ok(!puedeVerCompleta(propiedad('Publicada'), otroDueno));
    assert.ok(!puedeVerCompleta(propiedad('Publicada'), null));
});

test('edición: el dueño no edita comprometidas; otro ejecutivo nunca', () => {
    assert.ok(puedeEditar(propiedad('Publicada'), dueno));
    assert.ok(!puedeEditar(propiedad('Reservada'), dueno));
    assert.ok(!puedeEditar(propiedad('Arrendada'), dueno));
    assert.ok(puedeEditar(propiedad('Reservada'), responsable));
    assert.ok(!puedeEditar(propiedad('Publicada'), otroEjecutivo));
    assert.ok(puedeEditar(propiedad('Publicada'), admin));
});

test('solo el responsable o el admin publican; el dueño no', () => {
    assert.ok(transicionesPermitidas(propiedad('Disponible'), responsable).includes('Publicada'));
    assert.ok(transicionesPermitidas(propiedad('Disponible'), admin).includes('Publicada'));
    assert.deepEqual(transicionesPermitidas(propiedad('Disponible'), dueno), ['En mantención', 'Inactiva']);
    assert.deepEqual(transicionesPermitidas(propiedad('Disponible'), otroEjecutivo), []);
});

test('comprometidas no pasan a Inactiva; Arrendada solo vuelve a Disponible', () => {
    assert.ok(!transicionesPermitidas(propiedad('Reservada'), admin).includes('Inactiva'));
    assert.deepEqual(transicionesPermitidas(propiedad('Arrendada'), responsable), ['Disponible']);
    assert.deepEqual(transicionesPermitidas(propiedad('Reservada'), dueno), []);
    // Solo la segunda aprobación del arriendo reserva (RN-09).
    assert.ok(!transicionesPermitidas(propiedad('Publicada'), admin).includes('Reservada'));
});

test('cuentas no activas no operan', () => {
    assert.deepEqual(transicionesPermitidas(propiedad('Disponible'), u(3, 'propietario', 'Pendiente')), []);
    assert.ok(!puedeEditar(propiedad('Disponible'), u(2, 'ejecutivo', 'Inactivo')));
});
