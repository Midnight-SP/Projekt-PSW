const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authorize = require('../middleware/authorize');
const bcrypt = require('bcrypt');
const logger = require('../logger'); // Import the logger

// Login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ where: { username } });
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        req.session.user = {
          id: user.id,
          username: user.username,
          role: user.role
        };
        res.cookie('userId', user.id, { httpOnly: true, secure: true }); // Set userId cookie
        res.cookie('role', user.role, { httpOnly: true, secure: true }); // Set role cookie
        logger.info(`User logged in: ${user.username}`);
        res.json({ message: 'Login successful', role: user.role, userId: user.id });
      } else {
        logger.warn(`Invalid credentials for user: ${username}`);
        res.status(401).json({ message: 'Invalid credentials' });
      }
    } else {
      logger.warn(`Invalid credentials for user: ${username}`);
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (err) {
    logger.error('Login error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get all users (only for admin)
router.get('/', authorize('admin'), async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    logger.error('Error fetching users:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get user by ID (only for admin)
router.get('/:id', authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    logger.error('Error fetching user details:', err);
    res.status(500).json({ message: err.message });
  }
});

// Update user role (only for admin)
router.put('/:id', authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (user) {
      await user.update({ role: req.body.role });
      logger.info(`User role updated: ${user.username}`);
      res.json({ message: 'User role updated successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    logger.error('Error updating user role:', err);
    res.status(400).json({ message: err.message });
  }
});

// Delete user (only for admin)
router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (user) {
      await user.destroy();
      logger.info(`User deleted: ${user.username}`);
      res.json({ message: 'User deleted successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    logger.error('Error deleting user:', err);
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;