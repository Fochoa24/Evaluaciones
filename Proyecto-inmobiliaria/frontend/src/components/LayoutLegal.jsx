export default function LayoutLegal({ titulo, fecha, children }) {
    return (
        <main className="seccion">
            <article className="tarjeta-form legal">
                <p className="etiqueta">Información legal</p>
                <h1 className="legal-titulo">{titulo}</h1>
                <p className="legal-fecha">Última actualización: {fecha}</p>
                <div className="legal-cuerpo">{children}</div>
            </article>
        </main>
    );
}
