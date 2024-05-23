// /controllers/chatController.js
const axios = require('axios');
const jwt = require('jsonwebtoken');
const io = require('../server');

const Message = require('../models/messageModel');
const User = require('../models/userModel'); // Assuming you have a Message model

const sendMessage = async (req, res) => {
  const { senderId, receiverId, content, LLMsender, LLMreceiver } = req.body;
  console.log(req.body);
  console.log('Sender ID:', senderId);

  const sender = await User.findOne({ email: senderId });
  const receiver = await User.findOne({ email: receiverId });

  try {
    const newMessage = new Message({
      sender,
      receiver,
      content,
      timestamp: Date.now(),
      LLMsender,
      LLMreceiver
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error sending message', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
};

const getMessages = async (req, res) => {
  const { userId1, userId2 } = req.params;

  const user1 = await User.findOne({ email: userId1 });
  const user2 = await User.findOne({ email: userId2 });

  try {
    const messages = await Message.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 }
      ]
    }).sort({ timestamp: 1 });

    // Construct an array of messages with the sender's email
    const formattedMessages = await Promise.all(
      messages.map(async (message) => {
      console.log(message.sender)
      const sender_user = await User.findById(message.sender);
      return {
        sender: sender_user.email,
        content: message.content,
        timestamp: message.createdAt,
        LLMsender: message.LLMsender,
        LLMreceiver: message.LLMreceiver
      };
    })
  );

    res.status(200).json(formattedMessages);
  } catch (error) {
    console.error('Error getting messages', error);
    res.status(500).json({ message: 'Failed to get messages' });
  }
};

const queryLLM = async (req, res) => {
  const { message } = req.body;
  console.log(req.body);

  try {
    const response = await axios.post(process.env.LLM_API_URL, {
      contents: [{
      parts:[{
          text: message}]
      }]
    },
      //{ headers: {
      //   'Authorization': `Bearer ${process.env.LLM_API_KEY}`
      // }}
    );
    console.log(response.data)
    res.json({ content: response.data.candidates[0].content.parts[0].text });
  } catch (error) {
    console.error('Error querying LLM', error);
    res.status(500).json({ message: 'Failed to query LLM' });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  queryLLM
};
