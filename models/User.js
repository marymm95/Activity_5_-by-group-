// models/User.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../db'); // Adjust path as necessary

class User extends Model {}

User.init({
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING, // URL or path to the image
    allowNull: true,
  },
}, {
  sequelize,
  modelName: 'users',
});

module.exports = User;
