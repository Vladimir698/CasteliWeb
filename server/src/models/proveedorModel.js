'use strict';

module.exports = (sequelize, DataTypes) => {
  const Proveedor = sequelize.define(
    'Proveedor',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },

      cedula_juridica: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },

      telefono: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },

      correo: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },

      entidad_bancaria: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },

      cuenta_bancaria: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },

      direccion: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: 'proveedores',
      timestamps: false,
    }
  );

  return Proveedor;
};