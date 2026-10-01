'use strict';

module.exports = (sequelize, DataTypes) => {
  const Vehiculo = sequelize.define('Vehiculo', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    clienteId: { type: DataTypes.INTEGER, allowNull: true, field: 'cliente_id' },
    placa: { type: DataTypes.STRING(20), allowNull: false, field: 'placa', unique: true },
    marca: { type: DataTypes.STRING(80), allowNull: false, field: 'marca', defaultValue: 'No indicada' },
    modelo: { type: DataTypes.STRING(80), allowNull: false, field: 'modelo' },
    anio: { type: DataTypes.INTEGER, allowNull: true, field: 'anio' },
    kilometrajeActual: { type: DataTypes.INTEGER, allowNull: false, field: 'kilometraje_actual', defaultValue: 0 },
    proximoAceiteKm: { type: DataTypes.INTEGER, allowNull: true, field: 'proximo_aceite_km' },
    intervaloAceiteKm: { type: DataTypes.INTEGER, allowNull: true, field: 'intervalo_aceite_km' },
    intervaloAceiteMeses: { type: DataTypes.INTEGER, allowNull: true, field: 'intervalo_aceite_meses' },
    intervaloFrenosMeses: { type: DataTypes.INTEGER, allowNull: true, field: 'intervalo_frenos_meses' },
    ultimoAceiteFecha: { type: DataTypes.DATEONLY, allowNull: true, field: 'ultimo_aceite_fecha' },
    ultimoFrenosFecha: { type: DataTypes.DATEONLY, allowNull: true, field: 'ultimo_frenos_fecha' },
    intervaloRevisionKm: { type: DataTypes.INTEGER, allowNull: true, field: 'intervalo_revision_km' },
    ultimaRevisionKm: { type: DataTypes.INTEGER, allowNull: true, field: 'ultima_revision_km' },
    proximaRevisionKm: { type: DataTypes.INTEGER, allowNull: true, field: 'proxima_revision_km' },
    proximoAceiteFecha: { type: DataTypes.DATEONLY, allowNull: true, field: 'proximo_aceite_fecha' },
    proximoFrenosFecha: { type: DataTypes.DATEONLY, allowNull: true, field: 'proximo_frenos_fecha' },
    activo: { type: DataTypes.BOOLEAN, allowNull: false, field: 'activo', defaultValue: true }
  }, {
    tableName: 'vehiculos',
    freezeTableName: true,
    underscored: true,
    timestamps: true
  });

  return Vehiculo;
};
