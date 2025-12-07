const express = require('express');
const { body, validationResult } = require('express-validator');
const { Note, Subject, Tag, Attachment } = require('../models');
const authenticate = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const { subjectId, tagId, search, isPublic } = req.query;
    const where = { userId: req.user.id };

    if (subjectId) where.subjectId = subjectId;
    if (isPublic !== undefined) where.isPublic = isPublic === 'true';
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { content: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const include = [
      { model: Subject, as: 'subject', attributes: ['id', 'name', 'color'] },
      { model: Tag, as: 'tags', attributes: ['id', 'name'] },
      { model: Attachment, as: 'attachments', attributes: ['id', 'originalName', 'size', 'mimetype'] }
    ];

    if (tagId) {
      include[1].where = { id: tagId };
      include[1].required = true;
    }

    const notes = await Note.findAll({
      where,
      include,
      order: [['updatedAt', 'DESC']]
    });

    res.json({
      success: true,
      data: notes,
      count: notes.length
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const note = await Note.findOne({
      where: { 
        id: req.params.id,
        userId: req.user.id 
      },
      include: [
        { model: Subject, as: 'subject' },
        { model: Tag, as: 'tags' },
        { model: Attachment, as: 'attachments' }
      ]
    });

    if (!note) {
      return res.status(404).json({ 
        success: false,
        message: 'Note not found' 
      });
    }

    res.json({
      success: true,
      data: note
    });
  } catch (error) {
    next(error);
  }
});

router.post('/',
  authenticate,
  [
    body('title').trim().notEmpty(),
    body('content').optional(),
    body('subjectId').optional().isUUID(),
    body('tagIds').optional().isArray(),
    body('isPublic').optional().isBoolean()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false,
          errors: errors.array() 
        });
      }

      const { title, content, subjectId, tagIds, isPublic } = req.body;

      if (subjectId) {
        const subject = await Subject.findOne({
          where: { id: subjectId, userId: req.user.id }
        });
        if (!subject) {
          return res.status(404).json({ 
            success: false,
            message: 'Subject not found' 
          });
        }
      }

      const note = await Note.create({
        title,
        content,
        subjectId,
        isPublic: isPublic || false,
        userId: req.user.id
      });

      if (tagIds && tagIds.length > 0) {
        const tags = await Tag.findAll({
          where: { 
            id: tagIds,
            userId: req.user.id 
          }
        });
        await note.setTags(tags);
      }

      const createdNote = await Note.findByPk(note.id, {
        include: [
          { model: Subject, as: 'subject' },
          { model: Tag, as: 'tags' }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Note created successfully',
        data: createdNote
      });
    } catch (error) {
      next(error);
    }
  }
);

router.put('/:id',
  authenticate,
  [
    body('title').optional().trim().notEmpty(),
    body('content').optional(),
    body('subjectId').optional().isUUID(),
    body('tagIds').optional().isArray(),
    body('isPublic').optional().isBoolean()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false,
          errors: errors.array() 
        });
      }

      const note = await Note.findOne({
        where: { 
          id: req.params.id,
          userId: req.user.id 
        }
      });

      if (!note) {
        return res.status(404).json({ 
          success: false,
          message: 'Note not found' 
        });
      }

      const { title, content, subjectId, tagIds, isPublic } = req.body;

      if (title) note.title = title;
      if (content !== undefined) note.content = content;
      if (subjectId !== undefined) note.subjectId = subjectId;
      if (isPublic !== undefined) note.isPublic = isPublic;

      await note.save();

      if (tagIds) {
        const tags = await Tag.findAll({
          where: { 
            id: tagIds,
            userId: req.user.id 
          }
        });
        await note.setTags(tags);
      }

      const updatedNote = await Note.findByPk(note.id, {
        include: [
          { model: Subject, as: 'subject' },
          { model: Tag, as: 'tags' }
        ]
      });

      res.json({
        success: true,
        message: 'Note updated successfully',
        data: updatedNote
      });
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const note = await Note.findOne({
      where: { 
        id: req.params.id,
        userId: req.user.id 
      }
    });

    if (!note) {
      return res.status(404).json({ 
        success: false,
        message: 'Note not found' 
      });
    }

    await note.destroy();

    res.json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
