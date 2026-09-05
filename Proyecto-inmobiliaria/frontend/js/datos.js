window.tipoMap = {
    departamento: 'Departamento',
    casa: 'Casa',
    oficina: 'Oficina',
    local: 'Local comercial'
};

window.propiedades = [];

// Carga las propiedades desde la bd en atlas
window.propiedadesListas = fetch('/api/propiedades')
    .then((res) => res.json())
    .then((data) => {
        window.propiedades = data.map((p) => ({ ...p, id: p._id }));
        return window.propiedades;
    })
    .catch((err) => {
        console.error('No se pudieron cargar las propiedades:', err);
        return [];
    });
