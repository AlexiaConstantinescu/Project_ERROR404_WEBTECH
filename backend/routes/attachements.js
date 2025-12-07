const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { Attachment, Note } = require('../models');
const authenticate = require('../middleware/auth');

const router = express.Router();

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|zip/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('File type not allowed'));
  }
});

router.post('/', authenticate, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'No file uploaded' 
      });
    }

    const { noteId } = req.body;

    if (!noteId) {
      return res.status(400).json({ 
        success: false,
        message: 'Note ID required' 
      });
    }

    const note = await Note.findOne({
      where: { 
        id: noteId,
        userId: req.user.id 
      }
    });

    if (!note) {
      await fs.unlink(req.file.path);
      return res.status(404).json({ 
        success: false,
        message: 'Note not found' 
      });
    }

    const attachment = await Attachment.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      noteId,
      userId: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      data: attachment
    });
  } catch (error) {
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    next(error);
  }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const attachment = await Attachment.findByPk(req.params.id, {
      include: {
        model: Note,
        as: 'note',
        where: { userId: req.user.id }
      }
    });

    if (!attachment) {
      return res.status(404).json({ 
        success: false,
        message: 'File not found' 
      });
    }

    res.download(attachment.path, attachment.originalName);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const attachment = await Attachment.findByPk(req.params.id, {
      include: {
        model: Note,
        as: 'note',
        where: { userId: req.user.id }
      }
    });

    if (!attachment) {
      return res.status(404).json({ 
        success: false,
        message: 'File not found' 
      });
    }

    await fs.unlink(attachment.path);
    await attachment.destroy();

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
