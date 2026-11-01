/**
 * Reglas de acceso por estado de cuenta (§2.2), compartidas por login y middleware.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { motivoBloqueo } = require('../middleware/auth');

const codigo = (usuario, gestion) => motivoBloqueo(usuario, gestion)?.codigo ?? null;

test('cliente o propietario activo opera', () => {
    assert.equal(codigo({ estado: 'Activo', emailVerificado: true }, true), null);
});

test('sin correo confirmado no entra (cliente o propietario Pendiente)', () => {
    assert.equal(codigo({ estado: 'Pendiente', emailVerificado: false }, false), 'EMAIL_NO_VERIFICADO');
});

test('propietario con correo confirmado esperando al ejecutivo: inicia sesión pero no gestiona', () => {
    const enVerificacion = { estado: 'Pendiente', emailVerificado: true };
    assert.equal(codigo(enVerificacion, false), null);
    assert.equal(codigo(enVerificacion, true), 'CUENTA_EN_VERIFICACION');
});

test('cuenta Inactivo no entra aunque tenga el correo confirmado', () => {
    assert.equal(codigo({ estado: 'Inactivo', emailVerificado: true }, false), 'CUENTA_INACTIVA');
});
