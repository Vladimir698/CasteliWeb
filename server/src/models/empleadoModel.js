'use strict';

module.exports = (sequelize, DataTypes) => {
  const Empleado = sequelize.define(
    'Empleado',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      cedula: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      apellidos: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      ocupacion: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      especialidad: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
    },
    {
      tableName: 'empleados',
      timestamps: false,
    }
  );

  return Empleado;
};