'use strict';

const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');

require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    dialect: 'postgres',
    logging: false,
    define: { schema: 'public' }
  }
);

const db = {};

fs.readdirSync(__dirname)
  .filter(file => file.endsWith('Model.js'))
  .forEach(file => {
    const factory = require(path.join(__dirname, file));
    const model = factory(sequelize, DataTypes);
    db[model.name] = model;
  });

require('./associations')(db);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
