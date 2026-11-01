/**
 * Siguiente `id` numérico (identificador público) de una colección.
 * ponytail: max(id)+1 puede chocar con altas simultáneas; el índice único
 * lo rechaza (409). Dentro de una transacción (`session`) el choque es un
 * WriteConflict y la transacción se reintenta con el id siguiente.
 * @param {import('mongoose').Model} Modelo
 * @param {import('mongoose').ClientSession} [session]
 * @returns {Promise<number>}
 */
async function siguienteId(Modelo, session = null) {
    const ultimo = await Modelo.findOne().sort('-id').select('id').session(session);
    return (ultimo?.id || 0) + 1;
}

module.exports = { siguienteId };
