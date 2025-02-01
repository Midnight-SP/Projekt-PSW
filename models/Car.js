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
  },
  rentedBy: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  rentedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  seats: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 4 // Dodaj wartość domyślną
  },
  bodyType: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'sedan' // Dodaj wartość domyślną
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  currentUserName: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.User ? this.User.username : null;
    }
  }
});

module.exports = Car;