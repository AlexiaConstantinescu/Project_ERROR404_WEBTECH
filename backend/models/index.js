const User = require('./User');
const Note = require('./Note');
const Subject = require('./Subject');
const Tag = require('./Tag');
const Group = require('./Group');
const Attachment = require('./Attachment');
const { sequelize } = require('../config/database');

User.hasMany(Note, { foreignKey: 'userId', as: 'notes', onDelete: 'CASCADE' });
Note.belongsTo(User, { foreignKey: 'userId', as: 'author' });

User.hasMany(Subject, { foreignKey: 'userId', as: 'subjects', onDelete: 'CASCADE' });
Subject.belongsTo(User, { foreignKey: 'userId', as: 'owner' });

Subject.hasMany(Note, { foreignKey: 'subjectId', as: 'notes', onDelete: 'SET NULL' });
Note.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });

User.hasMany(Tag, { foreignKey: 'userId', as: 'tags', onDelete: 'CASCADE' });
Tag.belongsTo(User, { foreignKey: 'userId', as: 'owner' });

const NoteTag = sequelize.define('NoteTag', {}, { 
  tableName: 'note_tags',
  timestamps: false 
});

Note.belongsToMany(Tag, { through: NoteTag, as: 'tags', foreignKey: 'noteId' });
Tag.belongsToMany(Note, { through: NoteTag, as: 'notes', foreignKey: 'tagId' });

User.hasMany(Group, { foreignKey: 'ownerId', as: 'ownedGroups', onDelete: 'CASCADE' });
Group.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

const GroupMember = sequelize.define('GroupMember', {
  role: {
    type: sequelize.Sequelize.ENUM('member', 'admin'),
    defaultValue: 'member'
  }
}, {
  tableName: 'group_members',
  timestamps: true
});

User.belongsToMany(Group, { through: GroupMember, as: 'groups', foreignKey: 'userId' });
Group.belongsToMany(User, { through: GroupMember, as: 'members', foreignKey: 'groupId' });

Note.hasMany(Attachment, { foreignKey: 'noteId', as: 'attachments', onDelete: 'CASCADE' });
Attachment.belongsTo(Note, { foreignKey: 'noteId', as: 'note' });

User.hasMany(Attachment, { foreignKey: 'userId', as: 'attachments', onDelete: 'CASCADE' });
Attachment.belongsTo(User, { foreignKey: 'userId', as: 'uploader' });

const GroupNote = sequelize.define('GroupNote', {}, {
  tableName: 'group_notes',
  timestamps: true
});

Group.belongsToMany(Note, { through: GroupNote, as: 'sharedNotes', foreignKey: 'groupId' });
Note.belongsToMany(Group, { through: GroupNote, as: 'sharedInGroups', foreignKey: 'noteId' });

module.exports = {
  sequelize,
  User,
  Note,
  Subject,
  Tag,
  Group,
  Attachment,
  NoteTag,
  GroupMember,
  GroupNote
};
