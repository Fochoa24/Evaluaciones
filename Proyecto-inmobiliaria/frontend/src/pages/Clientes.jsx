import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useArriendos } from '../context/ArriendosContext';
import { useVisitas } from '../context/VisitasContext';

function construirClientes(interesadosVisitas, interesadosArriendos) {
    const mapa = new Map();

    interesadosVisitas.forEach((visita) => {
        const clave = (visita.email || '').toLowerCase();
        if (!clave) return;
        mapa.set(clave, {
            clave,
            nombre: visita.nombre,
            email: visita.email,
            telefono: visita.telefono || '',
            visitas: 1,
            solicitudes: 0,
            ultimaActividad: visita.fecha || visita.creadaEn
        });
    });

    interesadosArriendos.forEach((arriendo) => {
        const clave = (arriendo.clienteEmail || '').toLowerCase();
        if (!clave) return;
        const existente = mapa.get(clave);
        if (existente) {
            existente.solicitudes += 1;
            existente.ultimaActividad = arriendo.creadaEn;
            if (!existente.telefono) existente.telefono = arriendo.clienteTelefono || '';
        } else {
            mapa.set(clave, {
                clave,
                nombre: arriendo.clienteNombre,
                email: arriendo.clienteEmail,
                telefono: arriendo.clienteTelefono || '',
                visitas: 0,
                solicitudes: 1,
                ultimaActividad: arriendo.creadaEn
            });
        }
    });

    return Array.from(mapa.values()).sort((a, b) => b.visitas + b.solicitudes - (a.visitas + a.solicitudes));
}

export default function Clientes() {
    const { visitas } = useVisitas();
    const { arriendos } = useArriendos();
    const [busqueda, setBusqueda] = useState('');

    const clientes = useMemo(
        () => construirClientes(visitas, arriendos),
        [visitas, arriendos]
    );

    const filtrados = useMemo(() => {
        const q = busqueda.trim().toLowerCase();
        if (!q) return clientes;
        return clientes.filter(
            (item) =>
                item.nombre.toLowerCase().includes(q) ||
                item.email.toLowerCase().includes(q) ||
                item.telefono.includes(q)
        );
    }, [busqueda, clientes]);

    return (
        <main className="seccion dashboard-main">
            <section className="dashboard-header">
                <p className="etiqueta">ATENCIÓN AL CLIENTE</p>
                <h1>Clientes interesados</h1>
                <p className="subtitulo-login">
                    Personas que han solicitado visitas o arriendos, reunidas en una sola lista.
                </p>
            </section>

            <section className="contenedor-filtros" aria-label="Buscar clientes">
                <div className="bar-filtros" role="search">
                    <div className="grupo-filtro">
                        <label htmlFor="buscar-cliente">Buscar</label>
                        <input
                            type="search"
                            id="buscar-cliente"
                            placeholder="Nombre, correo o teléfono"
                            value={busqueda}
                            onChange={(event) => setBusqueda(event.target.value)}
                        />
                    </div>
                </div>
            </section>

            <section className="table-panel">
                <h2>Listado de interesados</h2>
                {filtrados.length ? (
                    <div className="tabla-wrap">
                        <table aria-label="Clientes interesados">
                            <thead>
                                <tr>
                                    <th scope="col">Cliente</th>
                                    <th scope="col">Contacto</th>
                                    <th scope="col">Visitas</th>
                                    <th scope="col">Solicitudes de arriendo</th>
                                    <th scope="col">Última actividad</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtrados.map((cliente) => (
                                    <tr key={cliente.clave}>
                                        <th scope="row">{cliente.nombre}</th>
                                        <td>
                                            {cliente.email}
                                            <div className="subtexto-tabla">
                                                {cliente.telefono || 'Sin teléfono'}
                                            </div>
                                        </td>
                                        <td>{cliente.visitas}</td>
                                        <td>{cliente.solicitudes}</td>
                                        <td>
                                            {cliente.ultimaActividad
                                                ? new Date(cliente.ultimaActividad).toLocaleDateString(
                                                      'es-CL'
                                                  )
                                                : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="mensaje sin-resultados visible" role="status">
                        No hay clientes con ese criterio.{' '}
                        <Link to="/propiedades">Explora propiedades</Link> para generar visitas.
                    </p>
                )}
            </section>
        </main>
    );
}
