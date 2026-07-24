'use strict';

module.exports = (sequelize, DataTypes) => {
  const Cliente = sequelize.define(
    'Cliente',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },

      nombre: {
        type: DataTypes.STRING(150),
        allowNull: false
      },

      identificacion: {
        type: DataTypes.STRING(30),
        allowNull: true,
        unique: true
      },

      telefono: {
        type: DataTypes.STRING(30),
        allowNull: true
      },

      correo: {
        type: DataTypes.STRING(150),
        allowNull: true,
        validate: {
          isEmail: true
        }
      },

      direccion: {
        type: DataTypes.TEXT,
        allowNull: true
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
      tableName: 'clientes',
      timestamps: true,
      underscored: true
    }
  );

  Cliente.associate = models => {
    Cliente.hasMany(models.Vehiculo, {
      foreignKey: 'cliente_id',
      as: 'vehiculos'
    });
  };

  return Cliente;
};