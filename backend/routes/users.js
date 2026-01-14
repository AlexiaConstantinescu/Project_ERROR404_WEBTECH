const express = require('express');
const authenticate = require('../middleware/auth');
const { User } = require('../models');

const router = express.Router();

router.get('/profile', authenticate, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

router.put('/profile', authenticate, async (req, res, next) => {
  try {
    const { name, avatar } = req.body;
    const user = await User.findByPk(req.user.id);

    if (name) user.name = name;
    if (avatar) user.avatar = avatar;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user.toJSON()
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
