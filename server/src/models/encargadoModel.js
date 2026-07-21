'use strict';

module.exports = (sequelize, DataTypes) => {
  const Encargado = sequelize.define(
    'Encargado',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      cedula: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      apellidos: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      parentesco: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      telefono: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      correo: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      ocupacion: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      lugar_trabajo: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      estudiante_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      estado: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
    },
    {
      tableName: 'encargados',
      timestamps: false,
    }
  );

Encargado.associate = (models) => {
  Encargado.belongsTo(models.Estudiante, { foreignKey: 'estudiante_id' });
};
  return Encargado;
};