'use strict';

module.exports = (sequelize, DataTypes) => {
  const Vehiculo = sequelize.define('Vehiculo', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    clienteId: { type: DataTypes.INTEGER, allowNull: true, field: 'cliente_id' },
    placa: { type: DataTypes.STRING(20), allowNull: false, field: 'placa', unique: true },
    marca: { type: DataTypes.STRING(80), allowNull: false, field: 'marca' },
    modelo: { type: DataTypes.STRING(80), allowNull: false, field: 'modelo' },
    anio: { type: DataTypes.INTEGER, allowNull: true, field: 'anio' },
    vin: { type: DataTypes.STRING(50), allowNull: true, field: 'vin' },
    numeroMotor: { type: DataTypes.STRING(50), allowNull: true, field: 'numero_motor' },
    motor: { type: DataTypes.STRING(80), allowNull: true, field: 'motor' },
    color: { type: DataTypes.STRING(40), allowNull: true, field: 'color' },
    combustible: { type: DataTypes.STRING(30), allowNull: true, field: 'combustible' },
    transmision: { type: DataTypes.STRING(30), allowNull: true, field: 'transmision' },
    traccion: { type: DataTypes.STRING(30), allowNull: true, field: 'traccion' },
    cilindraje: { type: DataTypes.STRING(30), allowNull: true, field: 'cilindraje' },
    kilometrajeActual: { type: DataTypes.INTEGER, allowNull: false, field: 'kilometraje_actual', defaultValue: 0 },
    activo: { type: DataTypes.BOOLEAN, allowNull: false, field: 'activo', defaultValue: true },
  }, {
    tableName: 'vehiculos',
    freezeTableName: true,
    underscored: true,
    timestamps: true
  });

  return Vehiculo;
};
