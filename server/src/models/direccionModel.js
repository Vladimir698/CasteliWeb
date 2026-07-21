'use strict';

module.exports = (sequelize, DataTypes) => {
  const Direccion = sequelize.define(
    'Direccion',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      provincia: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      canton: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      distrito: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      direccion: {
        type: DataTypes.STRING(250),
        allowNull: true,
      },
    },
    {
      tableName: 'direccion',
      timestamps: false,
    }
  );

  return Direccion;
};
