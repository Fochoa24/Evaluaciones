/**
 * Opciones comunes de schema: timestamps y JSON sin campos internos.
 * `id` numérico es el identificador público; `_id` no se expone.
 * password y tokenVerificacion se quitan aunque se hayan pedido con select.
 */
module.exports = {
    timestamps: true,
    toJSON: {
        transform: (_doc, ret) => {
            delete ret._id;
            delete ret.__v;
            delete ret.password;
            delete ret.tokenVerificacion;
            return ret;
        }
    }
};
