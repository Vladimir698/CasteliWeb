'use strict';

module.exports = (sequelize, DataTypes) => {
  const Usuario = sequelize.define('Usuario', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    apellidos: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    contrasenna: {
      type: DataTypes.STRING(300),
      allowNull: false,
    },
    rol_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    tableName: 'usuarios',
    timestamps: false,
  });

  return Usuario;
};