/**
 * Inicio de sesión contra usuarios de datos.js y cuentas registradas.
 * Exige que existan el usuario, la contraseña y el perfil.
 */
(function iniciarLogin() {
    const formulario = document.getElementById("form-login");

    if (!formulario) {
        return;
    }

    const usuario = document.getElementById("usuario");
    const password = document.getElementById("password");
    const perfil = document.getElementById("perfil");
    const errorUsuario = document.getElementById("error-usuario");
    const errorPassword = document.getElementById("error-password");
    const errorPerfil = document.getElementById("error-perfil");
    const mensaje = document.getElementById("mensaje-login");

    function validarFormato() {
        let esValido = true;
        const valorUsuario = limpiarTexto(usuario.value);
        const valorPassword = password.value;
        const valorPerfil = perfil.value;

        mostrarMensajeFormulario(mensaje, "", "");

        if (!valorUsuario) {
            marcarCampo(usuario, false);
            mostrarMensajeCampo(errorUsuario, "Ingresa tu RUT o correo electrónico.");
            esValido = false;
        } else if (!validarUsuario(valorUsuario)) {
            marcarCampo(usuario, false);
            mostrarMensajeCampo(errorUsuario, "Ingresa un correo válido o un RUT chileno (ej: 12.345.678-5).");
            esValido = false;
        } else {
            marcarCampo(usuario, true);
            mostrarMensajeCampo(errorUsuario, "");
        }

        if (!valorPassword) {
            marcarCampo(password, false);
            mostrarMensajeCampo(errorPassword, "Ingresa tu contraseña.");
            esValido = false;
        } else if (valorPassword.length < 6) {
            marcarCampo(password, false);
            mostrarMensajeCampo(errorPassword, "La contraseña debe tener al menos 6 caracteres.");
            esValido = false;
        } else {
            marcarCampo(password, true);
            mostrarMensajeCampo(errorPassword, "");
        }

        if (!valorPerfil) {
            marcarCampo(perfil, false);
            mostrarMensajeCampo(errorPerfil, "Selecciona el tipo de usuario.");
            esValido = false;
        } else {
            marcarCampo(perfil, true);
            mostrarMensajeCampo(errorPerfil, "");
        }

        return esValido;
    }

    formulario.addEventListener("submit", function (evento) {
        evento.preventDefault();

        if (!validarFormato()) {
            mostrarMensajeFormulario(
                mensaje,
                "Revisa los campos marcados e inténtalo nuevamente.",
                "error"
            );
            return;
        }

        const existente = buscarUsuario(usuario.value);

        if (!existente) {
            marcarCampo(usuario, false);
            mostrarMensajeCampo(errorUsuario, "No hay una cuenta con ese correo o RUT.");
            mostrarMensajeFormulario(
                mensaje,
                "Usuario no encontrado. Regístrate o usa una cuenta de prueba.",
                "error"
            );
            return;
        }

        if (existente.password !== password.value) {
            marcarCampo(password, false);
            mostrarMensajeCampo(errorPassword, "La contraseña no coincide.");
            mostrarMensajeFormulario(mensaje, "Contraseña incorrecta.", "error");
            return;
        }

        if (existente.perfil !== perfil.value) {
            marcarCampo(perfil, false);
            mostrarMensajeCampo(
                errorPerfil,
                "Este usuario es " + (NOMBRES_PERFIL[existente.perfil] || existente.perfil) + "."
            );
            mostrarMensajeFormulario(
                mensaje,
                "El perfil no corresponde a esta cuenta.",
                "error"
            );
            return;
        }

        guardarSesion({
            nombre: existente.nombre,
            usuario: existente.email,
            email: existente.email,
            perfil: existente.perfil
        });

        mostrarMensajeFormulario(
            mensaje,
            "Ingreso correcto como " + NOMBRES_PERFIL[existente.perfil] + ". Entrando al panel...",
            "exito"
        );

        window.setTimeout(function () {
            window.location.href = "./dashboard.html";
        }, 1200);
    });
})();
