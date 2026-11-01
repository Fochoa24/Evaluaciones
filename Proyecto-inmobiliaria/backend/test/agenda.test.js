const test = require('node:test');
const assert = require('node:assert/strict');
const {
    BLOQUES,
    ahoraChile,
    sumarDiasHabiles,
    validarHorario,
    buscarChoque,
    bloquesLibres,
    transicionesVisita
} = require('../utils/agenda');

// Viernes 30 de octubre de 2026, 10:00; el lunes 2 de noviembre es día hábil.
const ahora = { fecha: '2026-10-30', hora: '10:00' };

test('bloques y días hábiles (RN-01)', () => {
    assert.equal(BLOQUES.length, 18);
    assert.deepEqual([BLOQUES[0], BLOQUES.at(-1)], ['09:00', '17:30']);
    assert.equal(sumarDiasHabiles('2026-10-30', 1), '2026-11-02');
    assert.equal(sumarDiasHabiles('2026-12-07', 1), '2026-12-09'); // 8 de diciembre es feriado
    assert.equal(ahoraChile(new Date('2026-07-01T15:00:00Z')).hora, '11:00'); // UTC-4 en invierno
});

test('validarHorario: formato, horario, días y plazos', () => {
    const v = (fecha, hora, interno) => validarHorario(fecha, hora, { interno, ahora });
    assert.equal(v('2026-11-02', '09:00'), null);
    assert.equal(v('2026-11-02', '17:30'), null);
    assert.match(v('2026-11-02', '18:00'), /bloque/);
    assert.match(v('2026-11-02', '09:15'), /bloque/);
    assert.match(v('2026-11-07', '10:00'), /lunes a viernes/); // sábado
    assert.match(v('2026-12-08', '10:00'), /lunes a viernes/); // feriado
    assert.match(v('2026-10-30', '15:00'), /Elige una fecha/); // público: no el mismo día
    assert.equal(v('2026-10-30', '15:00', true), null); // interno: hoy sí
    assert.match(v('2026-10-30', '09:30', true), /ya pasó/);
    assert.match(v('2026-12-02', '10:00'), /Elige una fecha/); // más de 30 días
    assert.match(v('2026-02-30', '10:00'), /no es válida/);
    assert.match(v('2026-13-45', '10:00'), /no es válida/);
});

test('buscarChoque: propiedad 30 min, ejecutivo 60 min entre propiedades (RN-03/04)', () => {
    const base = { propiedadId: 1, ejecutivoId: 2, fecha: '2026-11-02', estado: 'Confirmada' };
    const otras = [{ ...base, id: 10, hora: '11:00' }];
    const con = (cambios) => buscarChoque({ ...base, ...cambios }, otras);
    assert.ok(con({ hora: '11:00' })); // misma propiedad, misma hora
    assert.equal(con({ hora: '11:30' }), undefined); // misma propiedad, bloque siguiente
    assert.ok(con({ propiedadId: 5, hora: '11:30' })); // mismo ejecutivo, sin traslado
    assert.equal(con({ propiedadId: 5, hora: '12:00' }), undefined); // con 30 min de traslado
    assert.equal(con({ propiedadId: 5, ejecutivoId: 6, hora: '11:00' }), undefined); // otro ejecutivo
    assert.equal(con({ id: 10, hora: '11:00' }), undefined); // se ignora a sí misma
    assert.equal(buscarChoque({ ...base, hora: '11:00' }, [{ ...otras[0], estado: 'Cancelada' }]), undefined);
    const libres = bloquesLibres({ propiedadId: 5, ejecutivoId: 2, fecha: '2026-11-02' }, otras);
    assert.ok(!libres.includes('10:30') && !libres.includes('11:30') && libres.includes('12:00'));
});

test('transicionesVisita por rol (§5.2)', () => {
    const v = { ejecutivoId: 2, clienteId: 4, estado: 'Pendiente' };
    assert.deepEqual(transicionesVisita(v, { rol: 'ejecutivo', id: 2 }), ['Confirmada', 'Rechazada', 'Cancelada']);
    assert.deepEqual(transicionesVisita(v, { rol: 'ejecutivo', id: 5 }), []);
    assert.deepEqual(transicionesVisita(v, { rol: 'cliente', id: 4 }), ['Cancelada']);
    assert.deepEqual(transicionesVisita(v, { rol: 'propietario', id: 3 }), []);
    assert.deepEqual(transicionesVisita({ ...v, estado: 'Confirmada' }, { rol: 'admin', id: 1 }), ['Realizada', 'Cancelada']);
    assert.deepEqual(transicionesVisita({ ...v, estado: 'Realizada' }, { rol: 'admin', id: 1 }), []);
});
