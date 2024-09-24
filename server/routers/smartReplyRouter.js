const express = require('express');
const { generateSmartReplies } = require('../controllers/smartReplyController');
const router = express.Router();

// Route to generate smart replies
router.post('/generate', generateSmartReplies);

module.exports = router;
