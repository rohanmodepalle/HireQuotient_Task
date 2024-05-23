// /routes/chatRoutes.js
const express = require('express');
const { sendMessage, getMessages, queryLLM } = require('../controllers/chatController');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/send', protect, sendMessage);
router.get('/messages/:userId1/:userId2', protect, getMessages);
router.post('/query-llm', protect, queryLLM);

module.exports = router;
