
const express = require('express');
const { body, validationResult } = require('express-validator');
const { Group, User, Note } = require('../models');
const authenticate = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const ownedGroups = await Group.findAll({
      where: { ownerId: req.user.id },
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'members', attributes: ['id', 'name', 'email'] }
      ]
    });

    const memberGroups = await req.user.getGroups({
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'members', attributes: ['id', 'name', 'email'] }
      ]
    });

    res.json({
      success: true,
      data: {
        owned: ownedGroups,
        member: memberGroups
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const group = await Group.findByPk(req.params.id, {
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'members', attributes: ['id', 'name', 'email'] },
        { model: Note, as: 'sharedNotes', include: [{ model: User, as: 'author', attributes: ['id', 'name'] }] }
      ]
    });

    if (!group) {
      return res.status(404).json({ 
        success: false,
        message: 'Group not found' 
      });
    }

    const isMember = group.members.some(m => m.id === req.user.id);
    const isOwner = group.ownerId === req.user.id;

    if (!isOwner && !isMember) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied' 
      });
    }

    res.json({
      success: true,
      data: group
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
    body('isPrivate').optional().isBoolean()
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

      const { name, description, isPrivate } = req.body;

      const group = await Group.create({
        name,
        description,
        isPrivate: isPrivate || false,
        ownerId: req.user.id
      });

      await group.addMember(req.user, { through: { role: 'admin' } });

      const createdGroup = await Group.findByPk(group.id, {
        include: [
          { model: User, as: 'owner', attributes: ['id', 'name', 'email'] },
          { model: User, as: 'members', attributes: ['id', 'name', 'email'] }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Group created successfully',
        data: createdGroup
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
    body('isPrivate').optional().isBoolean()
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

      const group = await Group.findByPk(req.params.id);

      if (!group) {
        return res.status(404).json({ 
          success: false,
          message: 'Group not found' 
        });
      }

      if (group.ownerId !== req.user.id) {
        return res.status(403).json({ 
          success: false,
          message: 'Only owner can edit group' 
        });
      }

      const { name, description, isPrivate } = req.body;

      if (name) group.name = name;
      if (description !== undefined) group.description = description;
      if (isPrivate !== undefined) group.isPrivate = isPrivate;

      await group.save();

      res.json({
        success: true,
        message: 'Group updated successfully',
        data: group
      });
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const group = await Group.findByPk(req.params.id);

    if (!group) {
      return res.status(404).json({ 
        success: false,
        message: 'Group not found' 
      });
    }

    if (group.ownerId !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        message: 'Only owner can delete group' 
      });
    }

    await group.destroy();

    res.json({
      success: true,
      message: 'Group deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/members',
  authenticate,
  [body('userId').isUUID()],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false,
          errors: errors.array() 
        });
      }

      const group = await Group.findByPk(req.params.id);

      if (!group) {
        return res.status(404).json({ 
          success: false,
          message: 'Group not found' 
        });
      }

      if (group.ownerId !== req.user.id) {
        return res.status(403).json({ 
          success: false,
          message: 'Only owner can add members' 
        });
      }

      const { userId } = req.body;
      const userToAdd = await User.findByPk(userId);

      if (!userToAdd) {
        return res.status(404).json({ 
          success: false,
          message: 'User not found' 
        });
      }

      await group.addMember(userToAdd, { through: { role: 'member' } });

      res.json({
        success: true,
        message: 'Member added successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id/members/:userId', authenticate, async (req, res, next) => {
  try {
    const group = await Group.findByPk(req.params.id);

    if (!group) {
      return res.status(404).json({ 
        success: false,
        message: 'Group not found' 
      });
    }

    if (group.ownerId !== req.user.id && req.params.userId !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied' 
      });
    }

    const userToRemove = await User.findByPk(req.params.userId);

    if (!userToRemove) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    await group.removeMember(userToRemove);

    res.json({
      success: true,
      message: 'Member removed successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
