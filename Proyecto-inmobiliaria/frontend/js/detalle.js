document.addEventListener('DOMContentLoaded', () => {
    const contenedor = document.getElementById('detalle-propiedad');
    if (!contenedor) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    window.propiedadesListas.then((data) => {
        const propiedad = data.find((item) => item.id === id) || data[0];

        if (!propiedad) {
            contenedor.innerHTML = '<p class="mensaje error visible">No se encontró la propiedad solicitada.</p>';
            return;
        }

        contenedor.innerHTML = `
            <article class="detalle-contenedor">
                <div class="detalle-imagen">
                    <img src="${propiedad.imagen}" alt="${propiedad.titulo}">
                </div>
                <div class="detalle-info">
                    <span class="tipo-propiedad">${propiedad.tipo}</span>
                    <h1>${propiedad.titulo}</h1>
                    <p class="ubicacion">${propiedad.ubicacion}</p>

                    <div class="detalle-precio">
                        <strong>$${propiedad.precioMensual.toLocaleString('es-CL')}</strong>
                        <span class="badge ${propiedad.estado === 'Reservada' ? 'reservada' : 'disponible'}">${propiedad.estado}</span>
                    </div>

                    <ul class="detalle-lista">
                        <li>📍 Comuna: ${propiedad.comuna}</li>
                        <li>🛏️ Dormitorios: ${propiedad.dormitorios}</li>
                        <li>🚿 Baños: ${propiedad.banos}</li>
                        <li>📐 Superficie: ${propiedad.superficie} m²</li>
                    </ul>

                    <a href="./propiedades.html" class="boton boton-ver">Volver al catálogo</a>
                </div>
            </article>
        `;
    });
});
