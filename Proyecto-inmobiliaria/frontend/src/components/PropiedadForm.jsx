import { useRef, useState } from 'react';
import { ESTADOS_PROPIEDAD, IMAGEN_DEFECTO, TIPOS_PROPIEDAD } from '../data/propiedades';
import Mensaje from './Mensaje';

const valoresPorDefecto = {
    titulo: '',
    tipo: 'Departamento',
    comuna: '',
    direccion: '',
    ubicacion: '',
    precioMensual: '',
    dormitorios: '0',
    banos: '1',
    superficie: '',
    estado: 'Disponible',
    imagen: ''
};

function normalizar(valores) {
    const base = { ...valoresPorDefecto, ...valores };
    return {
        titulo: String(base.titulo ?? ''),
        tipo: base.tipo || 'Departamento',
        comuna: String(base.comuna ?? ''),
        direccion: String(base.direccion ?? ''),
        ubicacion: String(base.ubicacion ?? ''),
        precioMensual: base.precioMensual === '' || base.precioMensual == null ? '' : String(base.precioMensual),
        dormitorios: String(base.dormitorios ?? '0'),
        banos: String(base.banos ?? '1'),
        superficie: base.superficie === '' || base.superficie == null ? '' : String(base.superficie),
        estado: base.estado || 'Disponible',
        imagen: String(base.imagen ?? '')
    };
}

export default function PropiedadForm({ valoresIniciales, onSubmit, textoBoton = 'Guardar' }) {
    const [form, setForm] = useState(() => normalizar(valoresIniciales));
    const [mensaje, setMensaje] = useState('');
    const [erroresCampo, setErroresCampo] = useState({});
    const formRef = useRef(null);

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
        if (!form.titulo.trim()) errores.titulo = 'El título es obligatorio.';
        if (!form.comuna.trim()) errores.comuna = 'La comuna es obligatoria.';

        const precio = Number(form.precioMensual);
        if (!Number.isFinite(precio) || precio <= 0) {
            errores.precioMensual = 'Ingresa un precio mensual válido.';
        }

        const superficie = Number(form.superficie);
        if (!Number.isFinite(superficie) || superficie <= 0) {
            errores.superficie = 'Ingresa una superficie válida en m².';
        }

        if (Object.keys(errores).length > 0) {
            setErroresCampo(errores);
            setMensaje('Revisa los campos marcados.');
            focoPrimerError(errores);
            return;
        }

        setErroresCampo({});
        setMensaje('');
        onSubmit({
            titulo: form.titulo.trim(),
            tipo: form.tipo,
            comuna: form.comuna.trim(),
            direccion: form.direccion.trim(),
            ubicacion: form.ubicacion.trim() || `${form.comuna.trim()}, Santiago`,
            precioMensual: precio,
            dormitorios: Number(form.dormitorios) || 0,
            banos: Number(form.banos) || 0,
            superficie,
            estado: form.estado,
            imagen: form.imagen.trim() || IMAGEN_DEFECTO
        });
    };

    return (
        <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="formulario-propiedad"
            noValidate
            aria-label="Formulario de propiedad"
        >
            <div className="campo campo-completo">
                <label htmlFor="titulo">Título</label>
                <input
                    type="text"
                    id="titulo"
                    name="titulo"
                    placeholder="Ej: Departamento Amueblado en Av. Italia"
                    value={form.titulo}
                    onChange={handleChange}
                    required
                    aria-invalid={erroresCampo.titulo ? 'true' : undefined}
                    aria-describedby={erroresCampo.titulo ? 'titulo-error' : undefined}
                />
                {erroresCampo.titulo && (
                    <span id="titulo-error" className="error-campo">
                        {erroresCampo.titulo}
                    </span>
                )}
            </div>

            <div className="campo">
                <label htmlFor="tipo">Tipo</label>
                <select id="tipo" name="tipo" value={form.tipo} onChange={handleChange} required>
                    {TIPOS_PROPIEDAD.map((tipo) => (
                        <option key={tipo} value={tipo}>
                            {tipo}
                        </option>
                    ))}
                </select>
            </div>

            <div className="campo">
                <label htmlFor="estado">Estado</label>
                <select id="estado" name="estado" value={form.estado} onChange={handleChange} required>
                    {ESTADOS_PROPIEDAD.map((estado) => (
                        <option key={estado} value={estado}>
                            {estado}
                        </option>
                    ))}
                </select>
            </div>

            <div className="campo">
                <label htmlFor="comuna">Comuna</label>
                <input
                    type="text"
                    id="comuna"
                    name="comuna"
                    placeholder="Ej: Providencia"
                    value={form.comuna}
                    onChange={handleChange}
                    required
                    aria-invalid={erroresCampo.comuna ? 'true' : undefined}
                    aria-describedby={erroresCampo.comuna ? 'comuna-error' : undefined}
                />
                {erroresCampo.comuna && (
                    <span id="comuna-error" className="error-campo">
                        {erroresCampo.comuna}
                    </span>
                )}
            </div>

            <div className="campo">
                <label htmlFor="direccion">Dirección</label>
                <input
                    type="text"
                    id="direccion"
                    name="direccion"
                    placeholder="Ej: Av. Italia 1234"
                    value={form.direccion}
                    onChange={handleChange}
                />
            </div>

            <div className="campo campo-completo">
                <label htmlFor="ubicacion">Ubicación de referencia (opcional)</label>
                <input
                    type="text"
                    id="ubicacion"
                    name="ubicacion"
                    placeholder="Ej: Providencia, Santiago"
                    value={form.ubicacion}
                    onChange={handleChange}
                />
            </div>

            <div className="campo">
                <label htmlFor="precioMensual">Precio mensual ($)</label>
                <input
                    type="number"
                    id="precioMensual"
                    name="precioMensual"
                    min="1"
                    placeholder="Ej: 550000"
                    value={form.precioMensual}
                    onChange={handleChange}
                    required
                    aria-invalid={erroresCampo.precioMensual ? 'true' : undefined}
                    aria-describedby={erroresCampo.precioMensual ? 'precioMensual-error' : undefined}
                />
                {erroresCampo.precioMensual && (
                    <span id="precioMensual-error" className="error-campo">
                        {erroresCampo.precioMensual}
                    </span>
                )}
            </div>

            <div className="campo">
                <label htmlFor="superficie">Superficie (m²)</label>
                <input
                    type="number"
                    id="superficie"
                    name="superficie"
                    min="1"
                    placeholder="Ej: 65"
                    value={form.superficie}
                    onChange={handleChange}
                    required
                    aria-invalid={erroresCampo.superficie ? 'true' : undefined}
                    aria-describedby={erroresCampo.superficie ? 'superficie-error' : undefined}
                />
                {erroresCampo.superficie && (
                    <span id="superficie-error" className="error-campo">
                        {erroresCampo.superficie}
                    </span>
                )}
            </div>

            <div className="campo">
                <label htmlFor="dormitorios">Dormitorios</label>
                <input
                    type="number"
                    id="dormitorios"
                    name="dormitorios"
                    min="0"
                    value={form.dormitorios}
                    onChange={handleChange}
                />
            </div>

            <div className="campo">
                <label htmlFor="banos">Baños</label>
                <input
                    type="number"
                    id="banos"
                    name="banos"
                    min="0"
                    value={form.banos}
                    onChange={handleChange}
                />
            </div>

            <div className="campo campo-completo">
                <label htmlFor="imagen">URL de imagen</label>
                <input
                    type="url"
                    id="imagen"
                    name="imagen"
                    placeholder="https://..."
                    value={form.imagen}
                    onChange={handleChange}
                />
            </div>

            <div className="campo-completo">
                <Mensaje texto={mensaje} tipo="error" />
            </div>

            <div className="campo-completo acciones-formulario">
                <button type="submit" className="boton">
                    {textoBoton}
                </button>
            </div>
        </form>
    );
}
