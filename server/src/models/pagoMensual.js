'use strict';

module.exports = (sequelize, DataTypes) => {
  const PagoMensual = sequelize.define('PagoMensual', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    encargado_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    estudiante_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    mes: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    anio: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    fecha_pago: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },

    monto: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true
    },

    forma_pago: {
      type: DataTypes.STRING(50),
      allowNull: true
    },

    observacion: {
      type: DataTypes.TEXT,
      allowNull: true
    },

    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: 'pagos_mensuales',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return PagoMensual;
};