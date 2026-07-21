'use strict';

module.exports = (sequelize, DataTypes) => {
  const Estudiante = sequelize.define(
    'Estudiante',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      cedula: {
        type: DataTypes.STRING(10),
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
      nacionalidad: {
        type: DataTypes.STRING(60),
        allowNull: false,
      },
      fechaNacimiento: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'fecha_nacimiento',
      },
      diagnostico: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      beca: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      estado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },

      provincia: { type: DataTypes.STRING(200), allowNull: true },
      canton: { type: DataTypes.STRING(200), allowNull: true },
      distrito: { type: DataTypes.STRING(200), allowNull: true },
      direccionExacta: {
        type: DataTypes.STRING(250),
        allowNull: true,
        field: 'direccion_exacta',
      },
      horario: {
  type: DataTypes.STRING(200),
  allowNull: true,
},
    },
    {
      tableName: 'estudiantes',
      timestamps: false,
    }
  );

Estudiante.associate = (models) => {
  Estudiante.hasMany(models.Encargado, { foreignKey: 'estudiante_id' });
};

  return Estudiante;
};