const express = require('express');
const { Share, Note } = require('../models');
const authenticate = require('../middleware/auth');

const router = express.Router();

// Create a share link for a note
router.post('/', authenticate, async (req, res) => {
    try {
        const { noteId } = req.body;

        if (!noteId) {
            return res.status(400).json({ success: false, message: 'Note ID is required' });
        }

        const note = await Note.findByPk(noteId);
        if (!note) {
            return res.status(404).json({ success: false, message: 'Note not found' });
        }

        if (note.userId !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // Check if share already exists
        let share = await Share.findOne({ where: { noteId } });
        if (!share) {
            share = await Share.create({ noteId });
        }

        const shareUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/share/${share.token}`;

        res.json({
            success: true,
            data: {
                token: share.token,
                url: shareUrl
            }
        });
    } catch (error) {
        console.error('Create share error:', error);
        res.status(500).json({ success: false, message: 'Error creating share link' });
    }
});

// Get shared note details (public endpoint - no auth required)
router.get('/:token', async (req, res) => {
    try {
        const { token } = req.params;

        const share = await Share.findOne({
            where: { token },
            include: [
                {
                    model: Note,
                    as: 'note',
                    include: [
                        {
                            model: require('../models').Subject,
                            as: 'subject'
                        },
                        {
                            model: require('../models').Tag,
                            as: 'tags'
                        },
                        {
                            model: require('../models').Attachment,
                            as: 'attachments'
                        }
                    ]
                }
            ]
        });

        if (!share) {
            return res.status(404).json({ success: false, message: 'Share not found' });
        }

        if (share.expiresAt && new Date() > share.expiresAt) {
            return res.status(403).json({ success: false, message: 'Share link has expired' });
        }

        res.json({
            success: true,
            data: share.note
        });
    } catch (error) {
        console.error('Get share error:', error);
        res.status(500).json({ success: false, message: 'Error retrieving shared note' });
    }
});

// Delete a share link
router.delete('/:token', authenticate, async (req, res) => {
    try {
        const { token } = req.params;

        const share = await Share.findOne({
            where: { token },
            include: [{ model: Note, as: 'note' }]
        });

        if (!share) {
            return res.status(404).json({ success: false, message: 'Share not found' });
        }

        if (share.note.userId !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        await share.destroy();

        res.json({ success: true, message: 'Share link deleted' });
    } catch (error) {
        console.error('Delete share error:', error);
        res.status(500).json({ success: false, message: 'Error deleting share link' });
    }
});

module.exports = router;
