'use strict';

module.exports = (sequelize, DataTypes) => {
  const Rol = sequelize.define('Rol', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING(50), allowNull: false, field: 'nombre', unique: true },
    descripcion: { type: DataTypes.TEXT, allowNull: true, field: 'descripcion' },
  }, {
    tableName: 'roles',
    freezeTableName: true,
    underscored: true,
    timestamps: true
  });

  return Rol;
};
