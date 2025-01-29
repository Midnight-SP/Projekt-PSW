const express = require('express');
const router = express.Router();
const Car = require('../models/Car');
const User = require('../models/User');

// LOGIN
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (user && user.password === password) {
      res.json({ message: 'Login successful' });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE
router.post('/', async (req, res) => {
  const car = new Car(req.body);
  try {
    const savedCar = await car.save();
    res.status(201).json(savedCar);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// READ
router.get('/', async (req, res) => {
  try {
    const cars = await Car.find();
    res.json(cars);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE
router.put('/:id', async (req, res) => {
  try {
    const updatedCar = await Car.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedCar);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    await Car.findByIdAndDelete(req.params.id);
    res.json({ message: 'Car deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// SEARCH
router.get('/search', async (req, res) => {
  const { query } = req.query;
  try {
    const cars = await Car.find({ model: new RegExp(query, 'i') });
    res.json(cars);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Initialize sample data
router.post('/init', async (req, res) => {
  const sampleCars = [
    { make: 'Toyota', model: 'Corolla', year: 2020, available: true },
    { make: 'Honda', model: 'Civic', year: 2019, available: true },
    { make: 'Ford', model: 'Mustang', year: 2018, available: false },
  ];
  try {
    await Car.insertMany(sampleCars);
    res.status(201).json({ message: 'Sample data initialized' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;