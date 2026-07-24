'use strict';

module.exports = (sequelize, DataTypes) => {
  const OrdenFoto = sequelize.define('OrdenFoto', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    ordenId: { type: DataTypes.INTEGER, allowNull: true, field: 'orden_id' },
    rutaArchivo: { type: DataTypes.TEXT, allowNull: true, field: 'ruta_archivo' },
    descripcion: { type: DataTypes.TEXT, allowNull: true, field: 'descripcion' },
    createdAt: { type: DataTypes.DATE, allowNull: false, field: 'created_at', defaultValue: DataTypes.NOW },
  }, {
    tableName: 'orden_fotos',
    freezeTableName: true,
    underscored: true,
    timestamps: false
  });

  return OrdenFoto;
};
