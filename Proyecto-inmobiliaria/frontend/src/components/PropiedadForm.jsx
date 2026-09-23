import { useState } from 'react';
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

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!form.titulo.trim() || !form.comuna.trim()) {
            setMensaje('El título y la comuna son obligatorios.');
            return;
        }

        const precio = Number(form.precioMensual);
        if (!Number.isFinite(precio) || precio <= 0) {
            setMensaje('Ingresa un precio mensual válido.');
            return;
        }

        const superficie = Number(form.superficie);
        if (!Number.isFinite(superficie) || superficie <= 0) {
            setMensaje('Ingresa una superficie válida en m².');
            return;
        }

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
        <form onSubmit={handleSubmit} className="formulario-propiedad">
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
                />
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
                />
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
                />
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
                />
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
