'use strict';

module.exports = (sequelize, DataTypes) => {
  const Cliente = sequelize.define('Cliente', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tipoCliente: { type: DataTypes.STRING(20), allowNull: false, field: 'tipo_cliente', defaultValue: 'persona' },
    nombre: { type: DataTypes.STRING(150), allowNull: false, field: 'nombre' },
    identificacion: { type: DataTypes.STRING(30), allowNull: true, field: 'identificacion' },
    telefono: { type: DataTypes.STRING(30), allowNull: true, field: 'telefono' },
    correo: { type: DataTypes.STRING(150), allowNull: true, field: 'correo' },
    direccion: { type: DataTypes.TEXT, allowNull: true, field: 'direccion' },
    notas: { type: DataTypes.TEXT, allowNull: true, field: 'notas' },
    activo: { type: DataTypes.BOOLEAN, allowNull: false, field: 'activo', defaultValue: true },
  }, {
    tableName: 'clientes',
    freezeTableName: true,
    underscored: true,
    timestamps: true
  });

  return Cliente;
};
