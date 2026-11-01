import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { TIPOS_PROPIEDAD } from '../data/propiedades';
import { api } from '../services/api';
import Mensaje from './Mensaje';

const valoresPorDefecto = {
    titulo: '',
    tipo: 'Departamento',
    comuna: '',
    direccion: '',
    ubicacion: '',
    precioMensual: '',
    gastosComunes: '0',
    dormitorios: '0',
    banos: '1',
    estacionamientos: '0',
    superficie: '',
    caracteristicas: '',
    propietarioId: '',
    ejecutivoId: '',
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
        precioMensual:
            base.precioMensual === '' || base.precioMensual == null
                ? ''
                : String(base.precioMensual),
        gastosComunes:
            base.gastosComunes === '' || base.gastosComunes == null
                ? '0'
                : String(base.gastosComunes),
        dormitorios: String(base.dormitorios ?? '0'),
        banos: String(base.banos ?? '1'),
        estacionamientos:
            base.estacionamientos === '' || base.estacionamientos == null
                ? '0'
                : String(base.estacionamientos),
        superficie:
            base.superficie === '' || base.superficie == null ? '' : String(base.superficie),
        caracteristicas: Array.isArray(base.caracteristicas)
            ? base.caracteristicas.join(', ')
            : String(base.caracteristicas ?? ''),
        propietarioId: base.propietarioId == null ? '' : String(base.propietarioId),
        ejecutivoId: base.ejecutivoId == null ? '' : String(base.ejecutivoId),
        imagen: String(base.imagen ?? '')
    };
}

/**
 * Formulario de alta y edición. El estado no se edita aquí (nace Disponible
 * y cambia con las acciones del detalle, §5.1). Internos eligen al dueño al
 * crear; el admin además elige o reasigna al ejecutivo (o "Automático").
 * `onSubmit` es async y puede devolver { ok, mensaje } para mostrar el error.
 */
export default function PropiedadForm({ valoresIniciales, onSubmit, textoBoton = 'Guardar' }) {
    const { user } = useAuth();
    const edicion = Boolean(valoresIniciales?.id);
    const esAdmin = user?.rol === 'admin';
    const mostrarDueno = esAdmin || (user?.rol === 'ejecutivo' && !edicion);
    const [form, setForm] = useState(() => normalizar(valoresIniciales));
    const [mensaje, setMensaje] = useState('');
    const [erroresCampo, setErroresCampo] = useState({});
    const [propietarios, setPropietarios] = useState([]);
    const [ejecutivos, setEjecutivos] = useState([]);
    const [enviando, setEnviando] = useState(false);
    const formRef = useRef(null);

    useEffect(() => {
        setForm(() => normalizar(valoresIniciales));
    }, [valoresIniciales]);

    // Solo cuentas activas pueden ser dueño o responsable (RN-11).
    useEffect(() => {
        if (mostrarDueno) {
            api('/api/usuarios?rol=propietario&estado=Activo').then(setPropietarios).catch(() => {});
        }
        if (esAdmin) {
            api('/api/usuarios?rol=ejecutivo&estado=Activo').then(setEjecutivos).catch(() => {});
        }
    }, [mostrarDueno, esAdmin]);

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

    const handleSubmit = async (event) => {
        event.preventDefault();

        const errores = {};
        if (!form.titulo.trim()) errores.titulo = 'El título es obligatorio.';
        if (!form.comuna.trim()) errores.comuna = 'La comuna es obligatoria.';
        if (mostrarDueno && !form.propietarioId) errores.propietarioId = 'Elige el propietario.';

        const precio = Number(form.precioMensual);
        if (!Number.isFinite(precio) || precio <= 0) {
            errores.precioMensual = 'Ingresa un precio mensual válido.';
        }

        const superficie = Number(form.superficie);
        if (!Number.isFinite(superficie) || superficie <= 0) {
            errores.superficie = 'Ingresa una superficie válida en m².';
        }

        const gastosComunes = Number(form.gastosComunes) || 0;
        if (gastosComunes < 0) {
            errores.gastosComunes = 'Los gastos comunes no pueden ser negativos.';
        }

        if (Object.keys(errores).length > 0) {
            setErroresCampo(errores);
            setMensaje('Revisa los campos marcados.');
            focoPrimerError(errores);
            return;
        }

        setErroresCampo({});
        setMensaje('');

        const caracteristicas = form.caracteristicas
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);

        setEnviando(true);
        const resultado = await onSubmit({
            titulo: form.titulo.trim(),
            tipo: form.tipo,
            comuna: form.comuna.trim(),
            direccion: form.direccion.trim(),
            // F24/F26: sin valores inventados; la tarjeta usa la imagen de respaldo al mostrar.
            ubicacion: form.ubicacion.trim(),
            precioMensual: precio,
            gastosComunes,
            dormitorios: Number(form.dormitorios) || 0,
            banos: Number(form.banos) || 0,
            estacionamientos: Number(form.estacionamientos) || 0,
            superficie,
            caracteristicas,
            imagen: form.imagen.trim(),
            ...(mostrarDueno && { propietarioId: Number(form.propietarioId) }),
            // Vacío = automático (menor carga, RN-12).
            ...(esAdmin && form.ejecutivoId && { ejecutivoId: Number(form.ejecutivoId) })
        });
        setEnviando(false);
        if (resultado && !resultado.ok) {
            setMensaje(resultado.mensaje);
        }
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
                <label htmlFor="gastosComunes">Gastos comunes ($)</label>
                <input
                    type="number"
                    id="gastosComunes"
                    name="gastosComunes"
                    min="0"
                    placeholder="Ej: 80000"
                    value={form.gastosComunes}
                    onChange={handleChange}
                    aria-invalid={erroresCampo.gastosComunes ? 'true' : undefined}
                    aria-describedby={erroresCampo.gastosComunes ? 'gastosComunes-error' : undefined}
                />
                {erroresCampo.gastosComunes && (
                    <span id="gastosComunes-error" className="error-campo">
                        {erroresCampo.gastosComunes}
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

            <div className="campo">
                <label htmlFor="estacionamientos">Estacionamientos</label>
                <input
                    type="number"
                    id="estacionamientos"
                    name="estacionamientos"
                    min="0"
                    value={form.estacionamientos}
                    onChange={handleChange}
                />
            </div>

            {mostrarDueno && (
                <div className="campo">
                    <label htmlFor="propietarioId">Propietario</label>
                    <select
                        id="propietarioId"
                        name="propietarioId"
                        value={form.propietarioId}
                        onChange={handleChange}
                        required
                        aria-invalid={erroresCampo.propietarioId ? 'true' : undefined}
                        aria-describedby={erroresCampo.propietarioId ? 'propietarioId-error' : undefined}
                    >
                        <option value="" disabled>
                            Elige un propietario activo
                        </option>
                        {propietarios.map((dueno) => (
                            <option key={dueno.id} value={dueno.id}>
                                {dueno.nombre}
                            </option>
                        ))}
                    </select>
                    {erroresCampo.propietarioId && (
                        <span id="propietarioId-error" className="error-campo">
                            {erroresCampo.propietarioId}
                        </span>
                    )}
                </div>
            )}

            {esAdmin && (
                <div className="campo">
                    <label htmlFor="ejecutivoId">Ejecutivo responsable</label>
                    <select id="ejecutivoId" name="ejecutivoId" value={form.ejecutivoId} onChange={handleChange}>
                        {!edicion && <option value="">Automático (menor carga)</option>}
                        {ejecutivos.map((ejecutivo) => (
                            <option key={ejecutivo.id} value={ejecutivo.id}>
                                {ejecutivo.nombre} ({ejecutivo.cartera} en cartera)
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div className="campo campo-completo">
                <label htmlFor="caracteristicas">Características (separadas por coma)</label>
                <input
                    type="text"
                    id="caracteristicas"
                    name="caracteristicas"
                    placeholder="Ej: Amueblado, Balcón, Calefacción"
                    value={form.caracteristicas}
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
                <button type="submit" className="boton" disabled={enviando}>
                    {textoBoton}
                </button>
            </div>
        </form>
    );
}
