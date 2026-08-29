/**
 * Formularios de registro y solicitud de visita.
 */
(function iniciarFormularios() {
    iniciarRegistro();
    iniciarVisita();
})();

function fechaHoyISO() {
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, "0");
    const dd = String(hoy.getDate()).padStart(2, "0");
    return yyyy + "-" + mm + "-" + dd;
}

function iniciarRegistro() {
    const formulario = document.getElementById("form-registro");

    if (!formulario) {
        return;
    }

    formulario.addEventListener("submit", function (evento) {
        evento.preventDefault();

        const nombre = document.getElementById("registro-nombre");
        const rut = document.getElementById("registro-rut");
        const email = document.getElementById("registro-email");
        const telefono = document.getElementById("registro-telefono");
        const password = document.getElementById("registro-password");
        const confirmar = document.getElementById("registro-confirmar");
        const perfil = document.getElementById("registro-perfil");
        const mensaje = document.getElementById("mensaje-registro");
        let esValido = true;

        if (limpiarTexto(nombre.value).length < 3) {
            marcarCampo(nombre, false);
            mostrarMensajeCampo(document.getElementById("error-registro-nombre"), "Ingresa tu nombre completo.");
            esValido = false;
        } else {
            marcarCampo(nombre, true);
            mostrarMensajeCampo(document.getElementById("error-registro-nombre"), "");
        }

        if (!validarRut(rut.value)) {
            marcarCampo(rut, false);
            mostrarMensajeCampo(document.getElementById("error-registro-rut"), "Ingresa un RUT chileno válido.");
            esValido = false;
        } else {
            marcarCampo(rut, true);
            mostrarMensajeCampo(document.getElementById("error-registro-rut"), "");
        }

        if (!validarEmail(email.value)) {
            marcarCampo(email, false);
            mostrarMensajeCampo(document.getElementById("error-registro-email"), "Ingresa un correo válido.");
            esValido = false;
        } else {
            marcarCampo(email, true);
            mostrarMensajeCampo(document.getElementById("error-registro-email"), "");
        }

        if (limpiarTexto(telefono.value).replace(/\D/g, "").length < 8) {
            marcarCampo(telefono, false);
            mostrarMensajeCampo(document.getElementById("error-registro-telefono"), "Ingresa un teléfono de al menos 8 dígitos.");
            esValido = false;
        } else {
            marcarCampo(telefono, true);
            mostrarMensajeCampo(document.getElementById("error-registro-telefono"), "");
        }

        if (password.value.length < 6) {
            marcarCampo(password, false);
            mostrarMensajeCampo(document.getElementById("error-registro-password"), "La contraseña debe tener al menos 6 caracteres.");
            esValido = false;
        } else {
            marcarCampo(password, true);
            mostrarMensajeCampo(document.getElementById("error-registro-password"), "");
        }

        if (confirmar.value !== password.value || !confirmar.value) {
            marcarCampo(confirmar, false);
            mostrarMensajeCampo(document.getElementById("error-registro-confirmar"), "Las contraseñas no coinciden.");
            esValido = false;
        } else {
            marcarCampo(confirmar, true);
            mostrarMensajeCampo(document.getElementById("error-registro-confirmar"), "");
        }

        if (!perfil.value) {
            marcarCampo(perfil, false);
            mostrarMensajeCampo(document.getElementById("error-registro-perfil"), "Selecciona un perfil.");
            esValido = false;
        } else {
            marcarCampo(perfil, true);
            mostrarMensajeCampo(document.getElementById("error-registro-perfil"), "");
        }

        if (buscarUsuario(email.value) || buscarUsuario(rut.value)) {
            mostrarMensajeFormulario(mensaje, "Ya existe una cuenta con ese correo o RUT.", "error");
            return;
        }

        if (!esValido) {
            mostrarMensajeFormulario(mensaje, "Revisa los campos marcados e inténtalo nuevamente.", "error");
            return;
        }

        guardarRegistro({
            id: "u-" + Date.now(),
            nombre: limpiarTexto(nombre.value),
            rut: limpiarTexto(rut.value),
            email: limpiarTexto(email.value).toLowerCase(),
            telefono: limpiarTexto(telefono.value),
            password: password.value,
            perfil: perfil.value
        });

        mostrarMensajeFormulario(
            mensaje,
            "Cuenta creada. Ya puedes iniciar sesión con tu correo o RUT.",
            "exito"
        );

        window.setTimeout(function () {
            window.location.href = "./login.html";
        }, 1200);
    });
}

function iniciarVisita() {
    const formulario = document.getElementById("form-visita");
    const fecha = document.getElementById("visita-fecha");

    if (!formulario || formulario.hidden || !fecha) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const propiedad = obtenerPropiedadPorId(params.get("id"));

    if (!propiedad || propiedad.estado !== "Disponible") {
        return;
    }

    fecha.min = fechaHoyISO();

    formulario.addEventListener("submit", function (evento) {
        evento.preventDefault();

        const nombre = document.getElementById("visita-nombre");
        const contacto = document.getElementById("visita-contacto");
        const hora = document.getElementById("visita-hora");
        const observaciones = document.getElementById("visita-observaciones");
        const mensaje = document.getElementById("mensaje-visita");
        let esValido = true;

        if (limpiarTexto(nombre.value).length < 3) {
            marcarCampo(nombre, false);
            mostrarMensajeCampo(document.getElementById("error-visita-nombre"), "Ingresa tu nombre completo.");
            esValido = false;
        } else {
            marcarCampo(nombre, true);
            mostrarMensajeCampo(document.getElementById("error-visita-nombre"), "");
        }

        if (!validarUsuario(contacto.value)) {
            marcarCampo(contacto, false);
            mostrarMensajeCampo(document.getElementById("error-visita-contacto"), "Ingresa un correo válido o un RUT chileno.");
            esValido = false;
        } else {
            marcarCampo(contacto, true);
            mostrarMensajeCampo(document.getElementById("error-visita-contacto"), "");
        }

        if (!fecha.value) {
            marcarCampo(fecha, false);
            mostrarMensajeCampo(document.getElementById("error-visita-fecha"), "Selecciona una fecha.");
            esValido = false;
        } else if (fecha.value < fecha.min) {
            marcarCampo(fecha, false);
            mostrarMensajeCampo(document.getElementById("error-visita-fecha"), "La visita no puede ser en una fecha pasada.");
            esValido = false;
        } else {
            marcarCampo(fecha, true);
            mostrarMensajeCampo(document.getElementById("error-visita-fecha"), "");
        }

        if (!hora.value) {
            marcarCampo(hora, false);
            mostrarMensajeCampo(document.getElementById("error-visita-hora"), "Selecciona un horario.");
            esValido = false;
        } else if (hora.value < "09:00" || hora.value > "18:00") {
            marcarCampo(hora, false);
            mostrarMensajeCampo(document.getElementById("error-visita-hora"), "Las visitas se agendan entre 09:00 y 18:00.");
            esValido = false;
        } else {
            marcarCampo(hora, true);
            mostrarMensajeCampo(document.getElementById("error-visita-hora"), "");
        }

        if (!esValido) {
            mostrarMensajeFormulario(mensaje, "Revisa los campos marcados e inténtalo nuevamente.", "error");
            return;
        }

        guardarVisita({
            id: "v-" + Date.now(),
            propiedadId: propiedad.id,
            titulo: propiedad.titulo,
            nombre: limpiarTexto(nombre.value),
            contacto: limpiarTexto(contacto.value),
            fecha: fecha.value,
            hora: hora.value,
            estado: "Pendiente",
            observaciones: limpiarTexto(observaciones.value)
        });

        mostrarMensajeFormulario(
            mensaje,
            "Solicitud enviada para el " + fecha.value + " a las " + hora.value +
                ". Un ejecutivo confirmará tu visita a " + propiedad.titulo + ".",
            "exito"
        );

        formulario.reset();
        fecha.min = fechaHoyISO();
    });
}
