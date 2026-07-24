'use strict';

module.exports = (sequelize, DataTypes) => {
  const Vehiculo = sequelize.define(
    'Vehiculo',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },

      cliente_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },

      placa: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
      },

      marca: {
        type: DataTypes.STRING(80),
        allowNull: false
      },

      modelo: {
        type: DataTypes.STRING(100),
        allowNull: false
      },

      anio: {
        type: DataTypes.INTEGER,
        allowNull: true
      },

      motor: {
        type: DataTypes.STRING(100),
        allowNull: true
      },

      vin: {
        type: DataTypes.STRING(50),
        allowNull: true,
        unique: true
      },

      color: {
        type: DataTypes.STRING(50),
        allowNull: true
      },

      kilometraje_actual: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          min: 0
        }
      },

      notas: {
        type: DataTypes.TEXT,
        allowNull: true
      },

      activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      }
    },
    {
      tableName: 'vehiculos',
      timestamps: true,
      underscored: true
    }
  );

  Vehiculo.associate = models => {
    Vehiculo.belongsTo(models.Cliente, {
      foreignKey: 'cliente_id',
      as: 'cliente'
    });

    Vehiculo.hasMany(models.OrdenTrabajo, {
      foreignKey: 'vehiculo_id',
      as: 'ordenes'
    });
  };

  return Vehiculo;
};