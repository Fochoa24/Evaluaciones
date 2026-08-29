/**
 * Panel según el perfil de la sesión: cliente, propietario, ejecutivo o admin.
 */
(function iniciarDashboard() {
    const raiz = document.getElementById("panel-contenido");
    const saludo = document.getElementById("panel-saludo");
    const btnSalir = document.getElementById("btn-salir");

    if (!raiz) {
        return;
    }

    const sesion = obtenerSesion();

    if (!sesion) {
        window.location.href = "./login.html";
        return;
    }

    const perfilNombre = NOMBRES_PERFIL[sesion.perfil] || sesion.perfil;
    saludo.textContent = "Hola, " + sesion.nombre + " · " + perfilNombre;

    if (btnSalir) {
        btnSalir.addEventListener("click", function () {
            cerrarSesion();
            window.location.href = "./login.html";
        });
    }

    if (sesion.perfil === "cliente") {
        renderCliente(raiz, sesion);
    } else if (sesion.perfil === "propietario") {
        renderPropietario(raiz, sesion);
    } else if (sesion.perfil === "ejecutivo") {
        renderEjecutivo(raiz);
    } else {
        renderAdmin(raiz);
    }
})();

function tarjetaDato(titulo, valor) {
    return (
        '<article class="tarjeta-dato">' +
            "<p>" + titulo + "</p>" +
            "<strong>" + valor + "</strong>" +
        "</article>"
    );
}

function renderCliente(raiz, sesion) {
    const visitas = obtenerVisitas().filter(function (visita) {
        return normalizarIdentificador(visita.contacto) === normalizarIdentificador(sesion.usuario)
            || normalizarIdentificador(visita.contacto) === normalizarIdentificador(sesion.email || "");
    });

    raiz.innerHTML =
        '<section class="panel-stats">' +
            tarjetaDato("Visitas solicitadas", visitas.length) +
            tarjetaDato("Propiedades publicadas", DATOS.propiedades.length) +
        "</section>" +
        '<section class="tarjeta-panel">' +
            "<h2>Mis solicitudes de visita</h2>" +
            listaVisitas(visitas, "Aún no has solicitado visitas. Revisa el catálogo y agenda una.") +
            '<p><a class="boton" href="./propiedades.html">Ver propiedades</a></p>' +
        "</section>";
}

function renderPropietario(raiz, sesion) {
    const usuario = buscarUsuario(sesion.usuario) || buscarUsuario(sesion.email || "");
    const propiedades = DATOS.propiedades.filter(function (propiedad) {
        return !usuario || propiedad.propietarioId === usuario.id || usuario.perfil === "propietario";
    });

    raiz.innerHTML =
        '<section class="panel-stats">' +
            tarjetaDato("Mis propiedades", propiedades.length) +
            tarjetaDato("Disponibles", contarPorEstado(propiedades, "Disponible")) +
            tarjetaDato("Reservadas", contarPorEstado(propiedades, "Reservada")) +
        "</section>" +
        '<section class="tarjeta-panel">' +
            "<h2>Estado de mis inmuebles</h2>" +
            tablaPropiedades(propiedades) +
        "</section>";
}

function renderEjecutivo(raiz) {
    const visitas = obtenerVisitas();

    raiz.innerHTML =
        '<section class="panel-stats">' +
            tarjetaDato("Visitas pendientes", visitas.filter(function (item) { return item.estado === "Pendiente"; }).length) +
            tarjetaDato("Propiedades", DATOS.propiedades.length) +
            tarjetaDato("Disponibles", contarPorEstado(DATOS.propiedades, "Disponible")) +
        "</section>" +
        '<section class="tarjeta-panel">' +
            "<h2>Agenda de visitas</h2>" +
            listaVisitas(visitas, "No hay visitas registradas.") +
        "</section>" +
        '<section class="tarjeta-panel">' +
            "<h2>Cartera de propiedades</h2>" +
            tablaPropiedades(DATOS.propiedades) +
        "</section>";
}

function renderAdmin(raiz) {
    const usuarios = DATOS.usuarios.concat(obtenerRegistros());

    raiz.innerHTML =
        '<section class="panel-stats">' +
            tarjetaDato("Usuarios", usuarios.length) +
            tarjetaDato("Propiedades", DATOS.propiedades.length) +
            tarjetaDato("Visitas", obtenerVisitas().length) +
        "</section>" +
        '<section class="tarjeta-panel">' +
            "<h2>Usuarios del sistema</h2>" +
            "<ul class='lista-simple'>" +
                usuarios.map(function (usuario) {
                    return "<li>" + usuario.nombre + " · " + (NOMBRES_PERFIL[usuario.perfil] || usuario.perfil) + "</li>";
                }).join("") +
            "</ul>" +
        "</section>" +
        '<section class="tarjeta-panel">' +
            "<h2>Propiedades administradas</h2>" +
            tablaPropiedades(DATOS.propiedades) +
        "</section>";
}

function contarPorEstado(lista, estado) {
    return lista.filter(function (item) {
        return item.estado === estado;
    }).length;
}

function listaVisitas(visitas, vacio) {
    if (!visitas.length) {
        return "<p class='texto-suave'>" + vacio + "</p>";
    }

    return (
        "<ul class='lista-simple'>" +
            visitas.map(function (visita) {
                return (
                    "<li>" +
                        "<strong>" + visita.titulo + "</strong><br>" +
                        visita.fecha + " · " + visita.hora + " · " + visita.estado +
                        "<br>" + visita.nombre + " (" + visita.contacto + ")" +
                    "</li>"
                );
            }).join("") +
        "</ul>"
    );
}

function tablaPropiedades(propiedades) {
    return (
        '<div class="tabla-contenedor">' +
            "<table class='tabla-panel'>" +
                "<thead><tr><th>Propiedad</th><th>Comuna</th><th>Estado</th><th>Arriendo</th></tr></thead>" +
                "<tbody>" +
                    propiedades.map(function (propiedad) {
                        return (
                            "<tr>" +
                                "<td>" + propiedad.titulo + "</td>" +
                                "<td>" + propiedad.comuna + "</td>" +
                                "<td>" + propiedad.estado + "</td>" +
                                "<td>" + formatearPrecio(propiedad.precio) + "</td>" +
                            "</tr>"
                        );
                    }).join("") +
                "</tbody>" +
            "</table>" +
        "</div>"
    );
}
