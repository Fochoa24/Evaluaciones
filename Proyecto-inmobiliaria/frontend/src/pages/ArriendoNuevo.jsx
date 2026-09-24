import { useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Mensaje from '../components/Mensaje';
import { useArriendos } from '../context/ArriendosContext';
import { useAuth } from '../context/AuthContext';
import { usePropiedades } from '../context/PropiedadesContext';

const solicitudInicial = {
    propiedadId: '',
    clienteNombre: '',
    clienteEmail: '',
    clienteTelefono: '',
    ingresoMensual: '',
    garantia: '',
    antecedentes: ''
};

export default function ArriendoNuevo() {
    const { id: propiedadIdParam } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { obtener, propiedades } = usePropiedades();
    const { crear } = useArriendos();
    const formRef = useRef(null);

    const disponibles = propiedades.filter(
        (item) => item.estado === 'Disponible' || item.estado === 'Publicada'
    );

    const [form, setForm] = useState(() => ({
        ...solicitudInicial,
        propiedadId: propiedadIdParam || '',
        clienteNombre: user?.nombre || '',
        clienteEmail: user?.email || '',
        clienteTelefono: user?.telefono || ''
    }));
    const [mensaje, setMensaje] = useState({ texto: '', tipo: 'success' });
    const [erroresCampo, setErroresCampo] = useState({});

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setErroresCampo((prev) => {
            if (!prev[name]) return prev;
            const siguiente = { ...prev };
            delete siguiente[name];
            return siguiente;
        });
    };

    const focoPrimerError = (errores) => {
        const primero = Object.keys(errores)[0];
        if (!primero || !formRef.current) return;
        const campo = formRef.current.elements.namedItem(primero);
        if (campo && typeof campo.focus === 'function') {
            campo.focus();
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        const errores = {};
        if (!form.propiedadId) errores.propiedadId = 'Elige una propiedad.';
        if (!form.clienteNombre.trim()) errores.clienteNombre = 'Ingresa tu nombre.';
        if (!form.clienteEmail.trim()) errores.clienteEmail = 'Ingresa tu correo.';
        if (!form.ingresoMensual || Number(form.ingresoMensual) <= 0) {
            errores.ingresoMensual = 'Ingresa un ingreso mensual válido.';
        }

        if (Object.keys(errores).length > 0) {
            setErroresCampo(errores);
            setMensaje('Completa los campos obligatorios.');
            focoPrimerError(errores);
            return;
        }

        const propiedad = obtener(form.propiedadId);
        if (!propiedad) {
            setMensaje({ texto: 'No se encontró la propiedad seleccionada.', tipo: 'error' });
            return;
        }

        if (propiedad.estado !== 'Disponible' && propiedad.estado !== 'Publicada') {
            setMensaje({
                texto: 'Esa propiedad no está disponible para nuevas solicitudes.',
                tipo: 'error'
            });
            return;
        }

        setErroresCampo({});
        crear({
            propiedadId: propiedad.id,
            propiedadTitulo: propiedad.titulo,
            clienteNombre: form.clienteNombre.trim(),
            clienteEmail: form.clienteEmail.trim(),
            clienteTelefono: form.clienteTelefono.trim(),
            ingresoMensual: Number(form.ingresoMensual),
            garantia: form.garantia.trim() || 'Por definir',
            antecedentes: form.antecedentes.trim() || 'Sin antecedentes adjuntos'
        });

        setMensaje({
            texto: 'Solicitud de arriendo enviada. Un ejecutivo la evaluará.',
            tipo: 'success'
        });
        setForm((prev) => ({ ...prev, ingresoMensual: '', garantia: '', antecedentes: '' }));

        window.setTimeout(() => navigate('/arriendos'), 1200);
    };

    return (
        <main className="seccion dashboard-main">
            <section className="dashboard-header">
                <p className="etiqueta">ARRIENDO</p>
                <h1>Solicitar arriendo de propiedad</h1>
                <p className="subtitulo-login">
                    Envía tus antecedentes para que un evaluador reserve la propiedad si aprueba la
                    solicitud.
                </p>
            </section>

            <section className="tarjeta-form">
                <form
                    ref={formRef}
                    onSubmit={handleSubmit}
                    className="formulario-propiedad"
                    noValidate
                    aria-label="Formulario de solicitud de arriendo"
                >
                    <div className="campo campo-completo">
                        <label htmlFor="propiedadId">Propiedad</label>
                        <select
                            id="propiedadId"
                            name="propiedadId"
                            value={form.propiedadId}
                            onChange={handleChange}
                            required
                            aria-invalid={erroresCampo.propiedadId ? 'true' : undefined}
                            aria-describedby={
                                erroresCampo.propiedadId ? 'propiedadId-error' : undefined
                            }
                        >
                            <option value="">Selecciona una propiedad</option>
                            {disponibles.map((propiedad) => (
                                <option key={propiedad.id} value={propiedad.id}>
                                    {propiedad.titulo} ({propiedad.comuna})
                                </option>
                            ))}
                        </select>
                        {erroresCampo.propiedadId && (
                            <span id="propiedadId-error" className="error-campo">
                                {erroresCampo.propiedadId}
                            </span>
                        )}
                    </div>

                    <div className="campo">
                        <label htmlFor="clienteNombre">Nombre completo</label>
                        <input
                            type="text"
                            id="clienteNombre"
                            name="clienteNombre"
                            value={form.clienteNombre}
                            onChange={handleChange}
                            required
                            autoComplete="name"
                            aria-invalid={erroresCampo.clienteNombre ? 'true' : undefined}
                            aria-describedby={
                                erroresCampo.clienteNombre ? 'clienteNombre-error' : undefined
                            }
                        />
                        {erroresCampo.clienteNombre && (
                            <span id="clienteNombre-error" className="error-campo">
                                {erroresCampo.clienteNombre}
                            </span>
                        )}
                    </div>

                    <div className="campo">
                        <label htmlFor="clienteEmail">Correo</label>
                        <input
                            type="email"
                            id="clienteEmail"
                            name="clienteEmail"
                            value={form.clienteEmail}
                            onChange={handleChange}
                            required
                            autoComplete="email"
                            aria-invalid={erroresCampo.clienteEmail ? 'true' : undefined}
                            aria-describedby={
                                erroresCampo.clienteEmail ? 'clienteEmail-error' : undefined
                            }
                        />
                        {erroresCampo.clienteEmail && (
                            <span id="clienteEmail-error" className="error-campo">
                                {erroresCampo.clienteEmail}
                            </span>
                        )}
                    </div>

                    <div className="campo">
                        <label htmlFor="clienteTelefono">Teléfono</label>
                        <input
                            type="tel"
                            id="clienteTelefono"
                            name="clienteTelefono"
                            placeholder="Ej: +56 9 1234 5678"
                            value={form.clienteTelefono}
                            onChange={handleChange}
                            autoComplete="tel"
                        />
                    </div>

                    <div className="campo">
                        <label htmlFor="ingresoMensual">Ingreso mensual ($)</label>
                        <input
                            type="number"
                            id="ingresoMensual"
                            name="ingresoMensual"
                            min="1"
                            placeholder="Ej: 1800000"
                            value={form.ingresoMensual}
                            onChange={handleChange}
                            required
                            aria-invalid={erroresCampo.ingresoMensual ? 'true' : undefined}
                            aria-describedby={
                                erroresCampo.ingresoMensual ? 'ingresoMensual-error' : undefined
                            }
                        />
                        {erroresCampo.ingresoMensual && (
                            <span id="ingresoMensual-error" className="error-campo">
                                {erroresCampo.ingresoMensual}
                            </span>
                        )}
                    </div>

                    <div className="campo">
                        <label htmlFor="garantia">Garantía ofrecida</label>
                        <input
                            type="text"
                            id="garantia"
                            name="garantia"
                            placeholder="Ej: Depósito 1 mes"
                            value={form.garantia}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="campo campo-completo">
                        <label htmlFor="antecedentes">Antecedentes laborales / de arriendo</label>
                        <textarea
                            id="antecedentes"
                            name="antecedentes"
                            className="campo-textarea"
                            placeholder="Describe tu situación laboral y referencias"
                            value={form.antecedentes}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="campo-completo">
                        <Mensaje texto={mensaje.texto} tipo={mensaje.tipo} />
                    </div>

                    <div className="campo-completo acciones-formulario">
                        <button type="submit" className="boton">
                            Enviar solicitud
                        </button>
                        <Link to="/propiedades" className="boton boton-secundario">
                            Volver al catálogo
                        </Link>
                    </div>
                </form>
            </section>
        </main>
    );
}
