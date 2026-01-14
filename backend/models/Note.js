const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Note = sequelize.define('Note', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 200]
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  subjectId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'subjects',
      key: 'id'
    }
  }
}, {
  tableName: 'notes',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['subject_id'] },
    { fields: ['created_at'] }
  ]
});

module.exports = Note;
