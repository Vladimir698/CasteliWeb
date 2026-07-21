'use strict';

module.exports = (sequelize, DataTypes) => {
  const Cheque = sequelize.define('Cheque', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    numero_cheque: { type: DataTypes.STRING(50), allowNull: false },
    proveedor: { type: DataTypes.STRING(150), allowNull: true },
    motivo: { type: DataTypes.STRING(250), allowNull: true },
    monto: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    estado: { type: DataTypes.BOOLEAN, allowNull: true },
    mes: { type: DataTypes.INTEGER, allowNull: true },
  }, {
    tableName: 'cheques',
    timestamps: false,
  });

  return Cheque;
};