'use strict';

module.exports = (sequelize, DataTypes) => {
  const Rol = sequelize.define('Rol', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    rol: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  }, {
    tableName: 'roles',
    timestamps: false,
  });

  return Rol;
};