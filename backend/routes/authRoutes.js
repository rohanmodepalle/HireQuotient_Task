const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const router = express.Router();

// Signup Route
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  console.log('Signup request body:', req.body);

  try {
    console.log('Attempting signup');
    const existingUser = await User.findOne({ email });
    console.log('Existing user:', existingUser);

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    console.log('Hashed password:', hashedPassword);
    const status = 'AVAILABLE';

    const newUser = new User({
      email,
      password: hashedPassword,
      status,
    });

    console.log('New user:', newUser);
    await newUser.save();

    const token = jwt.sign({ email: newUser.email, id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('Generated token:', token);
    res.status(201).json({ token });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Login request body:', req.body);

  try {
    const user = await User.findOne({ email });
    console.log('User found:', user);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    console.log('Is password correct:', isPasswordCorrect);

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // user.status = 'AVAILABLE';
    // console.log('Updated user status:', user);
    await user.save();

    const token = jwt.sign({ email: user.email, id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('Generated token:', token);
    res.status(200).json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// Logout Route
router.post('/logout', async (req, res) => {
  const { email } = req.body;
  console.log('Logout request body:', req.body);

  try {
    const user = await User.findOne({ email });
    console.log('User found for logout:', user);

    if (!user) {
      console.log('User not found during logout');
      return res.status(404).json({ message: 'User not found' });
    }

    // user.status = 'BUSY';
    // console.log('Updated user status to BUSY:', user);
    await user.save();

    res.status(200).json({ message: 'User logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// Get all User IDs Route
router.get('/user_list', async (req, res) => {
  try {
    const users = await User.find({}, 'email');
    const userEmails = users.map(user => ( user.email ));
    res.status(200).json({ userEmails });
  } catch (error) {
    console.error('Error getting user IDs:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// Get status of a user
router.get('/status/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findOne({ email: userId });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ status: user.status });
  } catch (error) {
    console.error('Error getting user status:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// Update status of a user
router.post('/status', async (req, res) => {
  try {
    const { email, status } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.status = status;
    await user.save();

    res.status(200).json({ message: 'User status updated successfully' });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

module.exports = router;
