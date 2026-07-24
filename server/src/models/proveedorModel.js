'use strict';

module.exports = (sequelize, DataTypes) => {
  const Proveedor = sequelize.define('Proveedor', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING(150), allowNull: false, field: 'nombre' },
    telefono: { type: DataTypes.STRING(30), allowNull: true, field: 'telefono' },
    correo: { type: DataTypes.STRING(150), allowNull: true, field: 'correo' },
    contacto: { type: DataTypes.STRING(120), allowNull: true, field: 'contacto' },
  }, {
    tableName: 'proveedores',
    freezeTableName: true,
    underscored: true,
    timestamps: false
  });

  return Proveedor;
};
