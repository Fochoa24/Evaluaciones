/**
 * Ficha de propiedad: completa la página detalle-propiedad.html.
 * El envío de la visita lo maneja formularios.js.
 */
(function iniciarDetalle() {
    const contenedor = document.getElementById("detalle-propiedad");
    const mensajeError = document.getElementById("detalle-no-encontrada");

    if (!contenedor) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const propiedad = obtenerPropiedadPorId(params.get("id"));

    if (!propiedad) {
        contenedor.hidden = true;
        if (mensajeError) {
            mensajeError.hidden = false;
        }
        return;
    }

    document.title = propiedad.titulo + " - Gestión Urbana";
    document.getElementById("detalle-imagen").src = propiedad.imagen;
    document.getElementById("detalle-imagen").alt = propiedad.titulo;
    document.getElementById("detalle-estado").textContent = propiedad.estado;
    document.getElementById("detalle-estado").className =
        "insignia-estado " + propiedad.estado.toLowerCase();
    document.getElementById("detalle-tipo").textContent = propiedad.tipo;
    document.getElementById("detalle-titulo").textContent = propiedad.titulo;
    document.getElementById("detalle-ubicacion").textContent =
        propiedad.direccion + ", " + propiedad.comuna + ", " + propiedad.ciudad;
    document.getElementById("detalle-descripcion").textContent = propiedad.descripcion;
    document.getElementById("detalle-precio").textContent = formatearPrecio(propiedad.precio) + " / mes";
    document.getElementById("detalle-gastos").textContent =
        propiedad.gastosComunes > 0
            ? "Gastos comunes: " + formatearPrecio(propiedad.gastosComunes)
            : "Sin gastos comunes informados";

    document.getElementById("dato-superficie").textContent = propiedad.superficie + " m²";
    document.getElementById("dato-dormitorios").textContent =
        propiedad.dormitorios > 0 ? propiedad.dormitorios : "No aplica";
    document.getElementById("dato-banos").textContent = propiedad.banos;
    document.getElementById("dato-estacionamientos").textContent = propiedad.estacionamientos;

    const lista = document.getElementById("detalle-caracteristicas");
    lista.innerHTML = "";
    propiedad.caracteristicas.forEach(function (item) {
        const chip = document.createElement("li");
        chip.textContent = item;
        lista.appendChild(chip);
    });

    const formulario = document.getElementById("form-visita");
    const avisoReserva = document.getElementById("aviso-reserva");
    const disponible = propiedad.estado === "Disponible";

    if (!disponible && formulario && avisoReserva) {
        formulario.hidden = true;
        avisoReserva.hidden = false;
    }
})();
