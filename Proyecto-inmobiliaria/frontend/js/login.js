document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-login');
    const mensaje = document.getElementById('mensaje-login');

    if (!form) {
        return;
    }

    const usuariosValidos = {
        admin: { password: 'admin123', rol: 'admin' },
        ejecutivo: { password: 'ejecutivo123', rol: 'ejecutivo' },
        propietario: { password: 'propietario123', rol: 'propietario' },
        cliente: { password: 'cliente123', rol: 'cliente' }
    };

    const mostrarMensaje = (texto, tipo) => {
        if (!mensaje) {
            return;
        }

        mensaje.textContent = texto;
        mensaje.className = `mensaje ${tipo} visible`;
    };

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const usuario = form.usuario.value.trim();
        const password = form.password.value.trim();
        const perfil = form.perfil.value;

        if (!usuario || !password || !perfil) {
            mostrarMensaje('Completa todos los campos antes de ingresar.', 'error');
            return;
        }

        const usuarioNormalizado = usuario.toLowerCase();
        const usuarioValido = Object.keys(usuariosValidos).find((key) => {
            return usuarioNormalizado === key || usuarioNormalizado === `${key}@inmobiliaria.cl`;
        });

        if (!usuarioValido) {
            mostrarMensaje('Usuario no registrado. Prueba con admin, cliente, ejecutivo o propietario.', 'error');
            return;
        }

        const credencial = usuariosValidos[usuarioValido];

        if (password !== credencial.password) {
            mostrarMensaje('La contraseña ingresada es incorrecta.', 'error');
            return;
        }

        if (perfil !== credencial.rol) {
            mostrarMensaje('El perfil seleccionado no coincide con el usuario ingresado.', 'error');
            return;
        }

        mostrarMensaje(`Bienvenido ${usuarioValido}. Redirigiendo al panel...`, 'success');

        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 800);
    });
});
