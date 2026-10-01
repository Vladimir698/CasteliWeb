'use strict';

const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');

require('dotenv').config();

const commonOptions = {
  dialect: 'postgres',
  logging: false,
  define: { schema: 'public' },
  pool: {
    max: Number(process.env.DB_POOL_MAX || 10),
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, commonOptions)
  : new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASS,
      {
        ...commonOptions,
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT || 5432)
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
