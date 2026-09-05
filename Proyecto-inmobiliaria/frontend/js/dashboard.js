document.addEventListener('DOMContentLoaded', () => {
    const statsContainer = document.getElementById('dashboard-stats');
    const tablaBody = document.getElementById('tabla-propiedades-body');

    if (!statsContainer || !tablaBody) {
        return;
    }

    window.propiedadesListas.then((data) => {
        const total = data.length;
        const disponibles = data.filter((item) => item.estado === 'Disponible').length;
        const reservadas = data.filter((item) => item.estado === 'Reservada').length;
        const ingreso = data.reduce((acc, item) => acc + item.precioMensual, 0);

        const stats = [
            { label: 'Total propiedades', value: total },
            { label: 'Disponibles', value: disponibles },
            { label: 'Reservadas', value: reservadas },
            { label: 'Ingreso estimado', value: `$${Math.round(ingreso / 1000)}k` }
        ];

        statsContainer.innerHTML = stats.map((stat) => `
            <article class="stat-card">
                <span class="stat-label">${stat.label}</span>
                <strong class="stat-value">${stat.value}</strong>
            </article>
        `).join('');

        tablaBody.innerHTML = data.map((propiedad) => `
            <tr>
                <td>${propiedad.titulo}</td>
                <td>${propiedad.tipo}</td>
                <td>${propiedad.comuna}</td>
                <td><span class="badge ${propiedad.estado === 'Reservada' ? 'reservada' : 'disponible'}">${propiedad.estado}</span></td>
                <td>$${propiedad.precioMensual.toLocaleString('es-CL')}</td>
                <td><a href="detalle-propiedad.html?id=${propiedad.id}" class="link-detalle">Ver</a></td>
            </tr>
        `).join('');
    });
});
