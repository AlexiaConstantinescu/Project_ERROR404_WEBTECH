const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const crypto = require('crypto');

const Share = sequelize.define('Share', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    token: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        defaultValue: () => crypto.randomBytes(16).toString('hex')
    },
    noteId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'notes',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'shares',
    timestamps: true
});

module.exports = Share;
