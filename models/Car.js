const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const Car = sequelize.define('Car', {
  make: {
    type: DataTypes.STRING,
    allowNull: false
  },
  model: {
    type: DataTypes.STRING,
    allowNull: false
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  available: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

module.exports = Car;