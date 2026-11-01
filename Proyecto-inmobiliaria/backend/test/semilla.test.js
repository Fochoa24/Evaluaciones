/**
 * Coherencia de la semilla con docs/modelo-logico.md, sin conectarse a Atlas.
 * Mongo no impone referencias: este test es la red de seguridad. npm test
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizarRut, rutValido } = require('../utils/rut');
const { FERIADOS, ESTADOS_VISITA_ACTIVOS } = require('../config/constantes');
const Usuario = require('../models/Usuario');
const Propiedad = require('../models/Propiedad');
const Visita = require('../models/Visita');
const Arriendo = require('../models/Arriendo');
const { usuarios, propiedades, visitas, arriendos } = require('../data/semilla');

const usuario = (id) => usuarios.find((u) => u.id === id);
const propiedad = (id) => propiedades.find((p) => p.id === id);

test('RUT: normaliza y valida módulo 11', () => {
    assert.equal(normalizarRut('12.345.678-5'), '12345678-5');
    assert.equal(normalizarRut(' 7654321k '), '7654321-K');
    assert.ok(rutValido('12345678-5'));
    assert.ok(!rutValido('9876543-2'));
    assert.ok(!rutValido('12345678'));
});

test('cada documento cumple su schema', () => {
    for (const [Modelo, docs] of [[Usuario, usuarios], [Propiedad, propiedades], [Visita, visitas], [Arriendo, arriendos]]) {
        for (const doc of docs) {
            const error = new Modelo(doc).validateSync();
            assert.equal(error, undefined, `${Modelo.modelName} ${doc.id}: ${error?.message}`);
        }
    }
});

test('ids, usuarios, correos y RUT son únicos', () => {
    for (const campo of ['id', 'usuario', 'email']) {
        assert.equal(new Set(usuarios.map((u) => u[campo])).size, usuarios.length, campo);
    }
    assert.equal(new Set(usuarios.map((u) => normalizarRut(u.rut))).size, usuarios.length, 'rut');
    for (const lista of [propiedades, visitas, arriendos]) {
        assert.equal(new Set(lista.map((d) => d.id)).size, lista.length);
    }
});

test('propiedades: dueño propietario y ejecutivo activo (RN-11); dueño inactivo → Inactiva (D10)', () => {
    for (const p of propiedades) {
        const dueno = usuario(p.propietarioId);
        const ejecutivo = usuario(p.ejecutivoId);
        assert.equal(dueno?.rol, 'propietario', `propiedad ${p.id}`);
        assert.equal(ejecutivo?.rol, 'ejecutivo', `propiedad ${p.id}`);
        assert.equal(ejecutivo.estado, 'Activo', `propiedad ${p.id}`);
        if (dueno.estado === 'Inactivo') assert.equal(p.estado, 'Inactiva', `propiedad ${p.id}`);
    }
});

test('visitas: ejecutivo de la propiedad; activas en Publicada, día hábil y horario (RN-01/02)', () => {
    for (const v of visitas) {
        const p = propiedad(v.propiedadId);
        assert.equal(v.ejecutivoId, p.ejecutivoId, `visita ${v.id}`);
        if (v.clienteId) assert.equal(usuario(v.clienteId)?.rol, 'cliente', `visita ${v.id}`);
        if (!ESTADOS_VISITA_ACTIVOS.includes(v.estado)) continue;
        const dia = new Date(`${v.fecha}T12:00:00`).getDay();
        assert.equal(p.estado, 'Publicada', `visita ${v.id}`);
        assert.ok(dia >= 1 && dia <= 5 && !FERIADOS.has(v.fecha), `visita ${v.id}: día no hábil`);
        assert.ok(v.hora >= '09:00' && v.hora <= '17:30', `visita ${v.id}: fuera de horario`);
    }
});

test('arriendos: cliente con cuenta (D7), una Aprobada por propiedad Reservada (RN-08)', () => {
    for (const a of arriendos) {
        const cliente = usuario(a.clienteId);
        assert.equal(cliente?.rol, 'cliente', `arriendo ${a.id}`);
        assert.equal(a.clienteEmail, cliente.email, `arriendo ${a.id}`);
        if (a.estado === 'Esperando propietario') assert.ok(a.venceEn, `arriendo ${a.id}: sin venceEn`);
    }
    for (const p of propiedades.filter((x) => x.estado === 'Reservada')) {
        assert.equal(arriendos.filter((a) => a.propiedadId === p.id && a.estado === 'Aprobada').length, 1, `propiedad ${p.id}`);
    }
});
