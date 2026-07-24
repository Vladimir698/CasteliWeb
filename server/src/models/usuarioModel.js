'use strict';

module.exports = (sequelize, DataTypes) => {
  const Usuario = sequelize.define('Usuario', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    rolId: { type: DataTypes.INTEGER, allowNull: true, field: 'rol_id' },
    nombre: { type: DataTypes.STRING(150), allowNull: false, field: 'nombre' },
    usuario: { type: DataTypes.STRING(60), allowNull: false, field: 'usuario', unique: true },
    email: { type: DataTypes.STRING(150), allowNull: true, field: 'email' },
    passwordHash: { type: DataTypes.TEXT, allowNull: false, field: 'password_hash' },
    activo: { type: DataTypes.BOOLEAN, allowNull: false, field: 'activo', defaultValue: true },
  }, {
    tableName: 'usuarios',
    freezeTableName: true,
    underscored: true,
    timestamps: true
  });

  return Usuario;
};
