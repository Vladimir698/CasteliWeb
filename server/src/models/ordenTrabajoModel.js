'use strict';

module.exports = (sequelize, DataTypes) => {
  const OrdenTrabajo = sequelize.define(
    'OrdenTrabajo',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },

      numero_orden: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: true
      },

      vehiculo_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },

      creada_por: {
        type: DataTypes.INTEGER,
        allowNull: true
      },

      fecha_ingreso: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },

      fecha_salida: {
        type: DataTypes.DATE,
        allowNull: true
      },

      kilometraje_ingreso: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 0
        }
      },

      nivel_combustible: {
        type: DataTypes.STRING(30),
        allowNull: true
      },

      problema_reportado: {
        type: DataTypes.TEXT,
        allowNull: false
      },

      estado: {
        type: DataTypes.ENUM(
          'recibida',
          'diagnostico',
          'esperando_aprobacion',
          'esperando_repuestos',
          'reparacion',
          'lista_para_facturar',
          'finalizada',
          'cancelada'
        ),
        allowNull: false,
        defaultValue: 'recibida'
      },

      observaciones: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    },
    {
      tableName: 'ordenes_trabajo',
      timestamps: true,
      underscored: true
    }
  );

  OrdenTrabajo.associate = models => {
    OrdenTrabajo.belongsTo(models.Vehiculo, {
      foreignKey: 'vehiculo_id',
      as: 'vehiculo'
    });
  };

  return OrdenTrabajo;
};