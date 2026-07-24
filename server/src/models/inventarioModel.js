'use strict';

module.exports = (sequelize, DataTypes) => {
  const Inventario = sequelize.define('Inventario', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    codigo: { type: DataTypes.STRING(50), allowNull: true, field: 'codigo', unique: true },
    descripcion: { type: DataTypes.STRING(200), allowNull: false, field: 'descripcion' },
    categoria: { type: DataTypes.STRING(80), allowNull: true, field: 'categoria' },
    existencia: { type: DataTypes.DECIMAL(12,2), allowNull: false, field: 'existencia', defaultValue: 0 },
    costo: { type: DataTypes.DECIMAL(12,2), allowNull: false, field: 'costo', defaultValue: 0 },
    precio: { type: DataTypes.DECIMAL(12,2), allowNull: false, field: 'precio', defaultValue: 0 },
  }, {
    tableName: 'inventario',
    freezeTableName: true,
    underscored: true,
    timestamps: false
  });

  return Inventario;
};
