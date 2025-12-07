const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Subject = sequelize.define('Subject', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  color: {
    type: DataTypes.STRING(7),
    defaultValue: '#3B82F6',
    validate: {
      is: /^#[0-9A-F]{6}$/i
    }
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'subjects',
  indexes: [
    {
      unique: true,
      fields: ['name', 'userId']
    }
  ]
});

module.exports = Subject;
