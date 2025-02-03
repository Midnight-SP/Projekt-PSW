const express = require('express');
const router = express.Router();
const Car = require('../models/Car');
const User = require('../models/User');
const authorize = require('../middleware/authorize');
const bcrypt = require('bcrypt');
const mqttClient = require('../server');

// LOGIN
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ where: { username } });
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      console.log(`Password match: ${isMatch}`);
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

// REGISTER
router.post('/register', async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already taken' });
    }
    const user = await User.create({ username, password, role });
    res.status(201).json({ message: 'User registered successfully', userId: user.id });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// CREATE (only for admin)
router.post('/', authorize('admin'), async (req, res) => {
  try {
    const car = await Car.create(req.body);
    mqttClient.publish('cars/created', JSON.stringify(car));
    res.status(201).json(car);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// READ
router.get('/', async (req, res) => {
  try {
    const cars = await Car.findAll();
    res.json(cars);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// READ by ID
router.get('/:id', async (req, res) => {
  try {
    const car = await Car.findByPk(req.params.id);
    if (car) {
      res.json(car);
    } else {
      res.status(404).json({ message: 'Car not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE (only for admin)
router.put('/:id', authorize('admin'), async (req, res) => {
  try {
    const car = await Car.findByPk(req.params.id);
    if (car) {
      await car.update(req.body);
      mqttClient.publish('cars/updated', JSON.stringify(car));
      res.json(car);
    } else {
      res.status(404).json({ message: 'Car not found' });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE (only for admin)
router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const car = await Car.findByPk(req.params.id);
    if (car) {
      await car.destroy();
      mqttClient.publish('cars/deleted', JSON.stringify(car));
      res.json({ message: 'Car deleted successfully' });
    } else {
      res.status(404).json({ message: 'Car not found' });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all users (only for admin)
router.get('/users', authorize('admin'), async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user by ID (only for admin)
router.get('/users/:id', authorize('admin'), async (req, res) => {
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
router.put('/users/:id', authorize('admin'), async (req, res) => {
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
router.delete('/users/:id', authorize('admin'), async (req, res) => {
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