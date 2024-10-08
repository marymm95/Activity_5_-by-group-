// db.js
const { Sequelize } = require('sequelize');

// Create a new instance of Sequelize
const sequelize = new Sequelize('ecommerce_db', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
});

module.exports = sequelize;
