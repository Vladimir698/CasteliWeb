'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
require('dotenv').config();

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(path.join(__dirname, '../../config/config.json'))[env];
const db = {};

let sequelize;

if (env === 'development') {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: 'postgres',
      logging: false
    }
  );
} else if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

if (db.Encargado && db.PagoMensual) {
  db.Encargado.hasMany(db.PagoMensual, {
    foreignKey: 'encargado_id',
    as: 'pagos'
  });

  db.PagoMensual.belongsTo(db.Encargado, {
    foreignKey: 'encargado_id',
    as: 'encargado'
  });
}

if (db.Estudiante && db.PagoMensual) {
  db.Estudiante.hasMany(db.PagoMensual, {
    foreignKey: 'estudiante_id',
    as: 'pagos'
  });

  db.PagoMensual.belongsTo(db.Estudiante, {
    foreignKey: 'estudiante_id',
    as: 'estudiante'
  });
}

if (db.Usuario && db.PagoMensual) {
  db.Usuario.hasMany(db.PagoMensual, {
    foreignKey: 'usuario_id',
    as: 'pagos_registrados'
  });

  db.PagoMensual.belongsTo(db.Usuario, {
    foreignKey: 'usuario_id',
    as: 'usuario'
  });
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;