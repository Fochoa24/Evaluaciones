document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-filtros');
    const contenedor = document.querySelector('.propiedades-grilla');

    if (!form || !contenedor) {
        return;
    }

    const mostrarMensaje = (mensaje, tipo = 'error') => {
        const mensajeElemento = document.getElementById('mensaje-filtros');
        if (!mensajeElemento) {
            return;
        }

        mensajeElemento.textContent = mensaje;
        mensajeElemento.className = `mensaje ${tipo} visible`;
    };

    const crearTarjeta = (propiedad) => {
        const estadoClase = propiedad.estado === 'Reservada' ? 'reservada' : 'disponible';
        const dormitoriosTexto = propiedad.dormitorios > 0 ? `${propiedad.dormitorios} Dorm.` : 'Planta libre';

        return `
            <article class="tarjeta-propiedad">
                <div class="imagen-contenedor">
                    <img src="${propiedad.imagen}" alt="${propiedad.titulo}">
                    <span class="insignia-estado ${estadoClase}">${propiedad.estado}</span>
                </div>
                <div class="info-propiedad">
                    <span class="tipo-propiedad">${propiedad.tipo}</span>
                    <h3>${propiedad.titulo}</h3>
                    <p class="ubicacion">${propiedad.ubicacion}</p>
                    
                    <div class="detalles-tecnicos">
                        <span>🛏️ ${dormitoriosTexto}</span>
                        <span>🚿 ${propiedad.banos} Baños</span>
                        <span>📐 ${propiedad.superficie} m²</span>
                    </div>

                    <div class="precio-accion">
                        <p class="precio">$${propiedad.precioMensual.toLocaleString('es-CL')} / mes</p>
                        <a href="detalle-propiedad.html?id=${propiedad.id}" class="boton boton-ver">Ver Detalle</a>
                    </div>
                </div>
            </article>
        `;
    };

    const renderizarPropiedades = (lista) => {
        if (!lista.length) {
            contenedor.innerHTML = `
                <div class="mensaje sin-resultados visible">
                    No se encontraron propiedades con esos filtros.
                </div>
            `;
            return;
        }

        contenedor.innerHTML = lista.map(crearTarjeta).join('');
    };

    const aplicarFiltros = (event) => {
        event.preventDefault();

        const tipo = form.elements.tipo.value.trim().toLowerCase();
        const comuna = form.elements.comuna.value.trim().toLowerCase();
        const precio = Number(form.elements.precio.value);
        const dormitorios = Number(form.elements.dormitorios.value);

        const resultados = window.propiedades.filter((propiedad) => {
            const coincideTipo = !tipo || propiedad.tipo.toLowerCase() === window.tipoMap[tipo]?.toLowerCase();
            const coincideComuna = !comuna || propiedad.comuna.toLowerCase().includes(comuna);
            const coincidePrecio = !precio || propiedad.precioMensual <= precio;
            const coincideDormitorios = !dormitorios || propiedad.dormitorios >= dormitorios;

            return coincideTipo && coincideComuna && coincidePrecio && coincideDormitorios;
        });

        renderizarPropiedades(resultados);

        if (resultados.length) {
            mostrarMensaje(`Mostrando ${resultados.length} propiedad(es) disponible(s).`, 'success');
        } else {
            mostrarMensaje('No encontramos propiedades con esos criterios.', 'error');
        }
    };

    form.addEventListener('submit', aplicarFiltros);
    window.propiedadesListas.then(renderizarPropiedades);
});
