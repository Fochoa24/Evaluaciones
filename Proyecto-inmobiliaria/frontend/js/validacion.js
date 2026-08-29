/**
 * Utilidades de validación reutilizables (login y solicitud de visita).
 * Entrega 1: validación en el cliente con mensajes claros.
 */

function limpiarTexto(valor) {
    return String(valor || "").trim();
}

function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Valida RUT chileno con dígito verificador (acepta puntos y guión). */
function validarRut(rut) {
    const limpio = limpiarTexto(rut).replace(/\./g, "").replace(/-/g, "").toUpperCase();

    if (!/^[0-9]{7,8}[0-9K]$/.test(limpio)) {
        return false;
    }

    const cuerpo = limpio.slice(0, -1);
    const dv = limpio.slice(-1);
    let suma = 0;
    let multiplo = 2;

    for (let i = cuerpo.length - 1; i >= 0; i -= 1) {
        suma += Number(cuerpo[i]) * multiplo;
        multiplo = multiplo === 7 ? 2 : multiplo + 1;
    }

    const resto = 11 - (suma % 11);
    const dvEsperado = resto === 11 ? "0" : resto === 10 ? "K" : String(resto);

    return dv === dvEsperado;
}

/** El usuario puede ingresar correo o RUT. */
function validarUsuario(valor) {
    const texto = limpiarTexto(valor);

    if (texto.includes("@")) {
        return validarEmail(texto);
    }

    return validarRut(texto);
}

function marcarCampo(input, valido) {
    input.classList.toggle("invalido", !valido);
}

function mostrarMensajeCampo(elemento, texto) {
    if (!elemento) {
        return;
    }

    elemento.textContent = texto || "";
}

function mostrarMensajeFormulario(elemento, texto, tipo) {
    if (!elemento) {
        return;
    }

    elemento.textContent = texto;
    elemento.classList.remove("exito", "error");

    if (texto && tipo) {
        elemento.classList.add(tipo);
    }
}
