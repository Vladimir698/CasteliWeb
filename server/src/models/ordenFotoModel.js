'use strict';

module.exports = (sequelize, DataTypes) => {
  const OrdenFoto = sequelize.define('OrdenFoto', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    trabajoId: { type: DataTypes.INTEGER, allowNull: false, field: 'trabajo_id' },
    usuarioId: { type: DataTypes.INTEGER, allowNull: true, field: 'usuario_id' },
    archivo: { type: DataTypes.STRING(255), allowNull: false, field: 'archivo' },
    nombreOriginal: { type: DataTypes.STRING(255), allowNull: true, field: 'nombre_original' },
    mimeType: { type: DataTypes.STRING(60), allowNull: false, field: 'mime_type' },
    createdAt: { type: DataTypes.DATE, allowNull: false, field: 'created_at', defaultValue: DataTypes.NOW }
  }, {
    tableName: 'orden_fotos',
    freezeTableName: true,
    underscored: true,
    timestamps: false
  });
  return OrdenFoto;
};
