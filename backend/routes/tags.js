const express = require('express');
const { body, validationResult } = require('express-validator');
const { Tag, Note } = require('../models');
const authenticate = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const tags = await Tag.findAll({
      where: { userId: req.user.id },
      include: [{
        model: Note,
        as: 'notes',
        attributes: ['id']
      }],
      order: [['name', 'ASC']]
    });

    const tagsWithCount = tags.map(tag => ({
      ...tag.toJSON(),
      notesCount: tag.notes.length
    }));

    res.json({
      success: true,
      data: tagsWithCount
    });
  } catch (error) {
    next(error);
  }
});

router.post('/',
  authenticate,
  [
    body('name').trim().notEmpty().isLength({ max: 50 })
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

      const { name } = req.body;

      const tag = await Tag.create({
        name,
        userId: req.user.id
      });

      res.status(201).json({
        success: true,
        message: 'Tag created successfully',
        data: tag
      });
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const tag = await Tag.findOne({
      where: { 
        id: req.params.id,
        userId: req.user.id 
      }
    });

    if (!tag) {
      return res.status(404).json({ 
        success: false,
        message: 'Tag not found' 
      });
    }

    await tag.destroy();

    res.json({
      success: true,
      message: 'Tag deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
