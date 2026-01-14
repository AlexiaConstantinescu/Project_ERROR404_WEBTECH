const express = require('express');
const { body, validationResult } = require('express-validator');
const { Subject, Note } = require('../models');
const authenticate = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const subjects = await Subject.findAll({
      where: { userId: req.user.id },
      include: [{
        model: Note,
        as: 'notes',
        attributes: ['id']
      }],
      order: [['name', 'ASC']]
    });

    const subjectsWithCount = subjects.map(subject => ({
      ...subject.toJSON(),
      notesCount: subject.notes.length
    }));

    res.json({
      success: true,
      data: subjectsWithCount
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const subject = await Subject.findOne({
      where: { 
        id: req.params.id,
        userId: req.user.id 
      },
      include: [{
        model: Note,
        as: 'notes',
        order: [['updatedAt', 'DESC']]
      }]
    });

    if (!subject) {
      return res.status(404).json({ 
        success: false,
        message: 'Subject not found' 
      });
    }

    res.json({
      success: true,
      data: subject
    });
  } catch (error) {
    next(error);
  }
});

router.post('/',
  authenticate,
  [
    body('name').trim().notEmpty(),
    body('description').optional().trim(),
    body('color').optional().matches(/^#[0-9A-F]{6}$/i)
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

      const { name, description, color } = req.body;

      const subject = await Subject.create({
        name,
        description,
        color: color || '#3B82F6',
        userId: req.user.id
      });

      res.status(201).json({
        success: true,
        message: 'Subject created successfully',
        data: subject
      });
    } catch (error) {
      next(error);
    }
  }
);

router.put('/:id',
  authenticate,
  [
    body('name').optional().trim().notEmpty(),
    body('description').optional().trim(),
    body('color').optional().matches(/^#[0-9A-F]{6}$/i)
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

      const subject = await Subject.findOne({
        where: { 
          id: req.params.id,
          userId: req.user.id 
        }
      });

      if (!subject) {
        return res.status(404).json({ 
          success: false,
          message: 'Subject not found' 
        });
      }

      const { name, description, color } = req.body;

      if (name) subject.name = name;
      if (description !== undefined) subject.description = description;
      if (color) subject.color = color;

      await subject.save();

      res.json({
        success: true,
        message: 'Subject updated successfully',
        data: subject
      });
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const subject = await Subject.findOne({
      where: { 
        id: req.params.id,
        userId: req.user.id 
      }
    });

    if (!subject) {
      return res.status(404).json({ 
        success: false,
        message: 'Subject not found' 
      });
    }

    await subject.destroy();

    res.json({
      success: true,
      message: 'Subject deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
