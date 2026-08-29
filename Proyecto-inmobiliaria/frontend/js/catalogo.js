/**
 * Catálogo de propiedades (RF5).
 * Dibuja las tarjetas desde datos.js y aplica los filtros.
 */
(function iniciarCatalogo() {
    const formulario = document.getElementById("form-filtros");
    const grilla = document.querySelector(".propiedades-grilla");

    if (!formulario || !grilla || typeof DATOS === "undefined") {
        return;
    }

    const filtroTipo = document.getElementById("filtro-tipo");
    const filtroComuna = document.getElementById("filtro-comuna");
    const filtroPrecio = document.getElementById("filtro-precio");
    const filtroDormitorios = document.getElementById("filtro-dormitorios");
    const filtroBanos = document.getElementById("filtro-banos");
    const btnLimpiar = document.getElementById("btn-limpiar");
    const sinResultados = document.getElementById("sin-resultados");
    const contador = document.getElementById("contador-resultados");

    function normalizar(texto) {
        return String(texto || "")
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
    }

    function tipoFiltro(tipo) {
        const valor = normalizar(tipo);
        if (valor.indexOf("local") !== -1) {
            return "local";
        }
        return valor;
    }

    function textoDormitorios(propiedad) {
        if (propiedad.dormitorios > 0) {
            return "🛏️ " + propiedad.dormitorios + " Dorms.";
        }
        if (propiedad.tipo === "Oficina") {
            return "🛏️ Privados";
        }
        return "🛏️ Planta libre";
    }

    function renderTarjetas() {
        const aviso = sinResultados;
        grilla.innerHTML = "";

        DATOS.propiedades.forEach(function (propiedad) {
            const articulo = document.createElement("article");
            const estadoClase = propiedad.estado.toLowerCase();

            articulo.className = "tarjeta-propiedad";
            articulo.dataset.id = propiedad.id;
            articulo.dataset.tipo = tipoFiltro(propiedad.tipo);
            articulo.dataset.comuna = propiedad.comuna;
            articulo.dataset.precio = String(propiedad.precio);
            articulo.dataset.dormitorios = String(propiedad.dormitorios);
            articulo.dataset.banos = String(propiedad.banos);

            articulo.innerHTML =
                '<div class="imagen-contenedor">' +
                    '<img src="' + propiedad.imagen + '" alt="' + propiedad.titulo + '">' +
                    '<span class="insignia-estado ' + estadoClase + '">' + propiedad.estado + "</span>" +
                "</div>" +
                '<div class="info-propiedad">' +
                    '<span class="tipo-propiedad">' + propiedad.tipo + "</span>" +
                    "<h3>" + propiedad.titulo + "</h3>" +
                    '<p class="ubicacion">' + propiedad.comuna + ", " + propiedad.ciudad + "</p>" +
                    '<div class="detalles-tecnicos">' +
                        "<span>" + textoDormitorios(propiedad) + "</span>" +
                        "<span>🚿 " + propiedad.banos + " Baños</span>" +
                        "<span>📐 " + propiedad.superficie + " m²</span>" +
                    "</div>" +
                    '<div class="precio-accion">' +
                        '<p class="precio">' + formatearPrecio(propiedad.precio) + " / mes</p>" +
                        '<a href="./detalle-propiedad.html?id=' + propiedad.id + '" class="boton boton-ver">Ver Detalle</a>' +
                    "</div>" +
                "</div>";

            grilla.appendChild(articulo);
        });

        if (aviso) {
            grilla.appendChild(aviso);
        }
    }

    function aplicarFiltros() {
        const tarjetas = Array.from(grilla.querySelectorAll(".tarjeta-propiedad"));
        const tipo = normalizar(filtroTipo.value);
        const comuna = normalizar(filtroComuna.value);
        const precioMax = Number(filtroPrecio.value);
        const dormitoriosMin = Number(filtroDormitorios.value);
        const banosMin = Number(filtroBanos ? filtroBanos.value : 0);
        let visibles = 0;

        tarjetas.forEach(function (tarjeta) {
            const coincideTipo = !tipo || normalizar(tarjeta.dataset.tipo) === tipo;
            const coincideComuna = !comuna || normalizar(tarjeta.dataset.comuna).indexOf(comuna) !== -1;
            const coincidePrecio = !filtroPrecio.value || Number(tarjeta.dataset.precio) <= precioMax;
            const coincideDormitorios = !filtroDormitorios.value || Number(tarjeta.dataset.dormitorios) >= dormitoriosMin;
            const coincideBanos = !filtroBanos || !filtroBanos.value || Number(tarjeta.dataset.banos) >= banosMin;
            const coincide = coincideTipo && coincideComuna && coincidePrecio && coincideDormitorios && coincideBanos;

            tarjeta.classList.toggle("oculta", !coincide);

            if (coincide) {
                visibles += 1;
            }
        });

        if (sinResultados) {
            sinResultados.hidden = visibles !== 0;
        }

        if (contador) {
            const total = tarjetas.length;
            contador.textContent = visibles === total
                ? "Mostrando " + total + " propiedades"
                : "Mostrando " + visibles + " de " + total + " propiedades";
        }
    }

    renderTarjetas();

    formulario.addEventListener("submit", function (evento) {
        evento.preventDefault();
        aplicarFiltros();
    });

    ["change", "input"].forEach(function (evento) {
        formulario.addEventListener(evento, aplicarFiltros);
    });

    if (btnLimpiar) {
        btnLimpiar.addEventListener("click", function () {
            formulario.reset();
            aplicarFiltros();
        });
    }

    aplicarFiltros();
})();
