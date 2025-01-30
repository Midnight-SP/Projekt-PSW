const express = require('express');
const router = express.Router();
const Car = require('../models/Car');
const User = require('../models/User');
const authorize = require('../middleware/authorize');
const bcrypt = require('bcrypt');

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
        res.json({ message: 'Login successful', role: user.role });
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

// Check users
router.get('/check-users', async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: err.message });
  }
});

// CREATE (only for admin)
router.post('/', authorize('admin'), async (req, res) => {
  try {
    const car = await Car.create(req.body);
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

// UPDATE (only for admin)
router.put('/:id', authorize('admin'), async (req, res) => {
  try {
    const car = await Car.findByPk(req.params.id);
    if (car) {
      await car.update(req.body);
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
      res.json({ message: 'Car deleted' });
    } else {
      res.status(404).json({ message: 'Car not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// SEARCH
router.get('/search', async (req, res) => {
  const { query } = req.query;
  try {
    const cars = await Car.findAll({ where: { model: { [Sequelize.Op.like]: `%${query}%` } } });
    res.json(cars);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Initialize sample data (only for admin)
router.post('/init', authorize('admin'), async (req, res) => {
  const sampleCars = [
    { make: 'Toyota', model: 'Corolla', year: 2020, available: true },
    { make: 'Honda', model: 'Civic', year: 2019, available: true },
    { make: 'Ford', model: 'Mustang', year: 2018, available: false },
  ];
  try {
    await Car.bulkCreate(sampleCars);
    res.status(201).json({ message: 'Sample data initialized' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Initialize test users
router.post('/init-users', async (req, res) => {
  const users = [
    { username: 'admin', password: 'admin123', role: 'admin' },
    { username: 'user', password: 'user123', role: 'user' }
  ];

  try {
    for (const userData of users) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await User.create({ ...userData, password: hashedPassword });
      console.log(`User created: ${user.username}`);
    }
    res.status(201).json({ message: 'Test users initialized' });
  } catch (err) {
    console.error('Error initializing users:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;