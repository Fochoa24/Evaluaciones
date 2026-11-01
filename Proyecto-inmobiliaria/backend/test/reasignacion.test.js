/**
 * Reparto proporcional de cartera (RN-16).
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { repartirCartera } = require('../utils/reasignacion');

const cartera = (n, estado = 'Publicada') => Array.from({ length: n }, (_, i) => ({ id: i + 1, estado }));
/** Cuántas propiedades recibió cada ejecutivo. */
const recibidas = (asignacion) =>
    [...asignacion.values()].reduce((m, e) => m.set(e, (m.get(e) || 0) + 1), new Map());

test('ejemplo del documento: E2=3, E3=1, 6 propiedades → ambos terminan con 5', () => {
    const r = recibidas(repartirCartera(cartera(6), new Map([[2, 3], [3, 1]])));
    assert.equal(r.get(3), 4);
    assert.equal(r.get(2), 2);
});

test('nadie recibe toda la cartera si hay cargas parejas', () => {
    const r = recibidas(repartirCartera(cartera(7), new Map([[5, 0], [6, 0], [7, 0]])));
    assert.deepEqual([...r.values()].sort(), [2, 2, 3]);
});

test('empate: gana el id menor', () => {
    const asignacion = repartirCartera(cartera(1), new Map([[9, 2], [4, 2]]));
    assert.equal(asignacion.get(1), 4);
});

test('Inactiva cambia de responsable pero no suma carga', () => {
    const propiedades = [{ id: 1, estado: 'Inactiva' }, { id: 2, estado: 'Inactiva' }, { id: 3, estado: 'Publicada' }];
    const asignacion = repartirCartera(propiedades, new Map([[2, 0], [3, 1]]));
    assert.deepEqual([...asignacion.values()], [2, 2, 2]);
});

test('sin ejecutivos activos no reparte', () => {
    assert.throws(() => repartirCartera(cartera(1), new Map()));
});
