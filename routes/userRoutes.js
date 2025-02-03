const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authorize = require('../middleware/authorize');
const bcrypt = require('bcrypt');

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
        res.json({ message: 'Login successful', role: user.role, userId: user.id });
      } else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get all users (only for admin)
router.get('/', authorize('admin'), async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
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
    res.status(500).json({ message: err.message });
  }
});

// Update user role (only for admin)
router.put('/:id', authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (user) {
      await user.update({ role: req.body.role });
      res.json({ message: 'User role updated successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete user (only for admin)
router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (user) {
      await user.destroy();
      res.json({ message: 'User deleted successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;