const express = require('express');
const router = express.Router();
const Car = require('../models/Car');
const User = require('../models/User'); // Ensure User model is imported
const authorize = require('../middleware/authorize');
const mqttClient = require('../server');
const logger = require('../logger'); // Import the logger

// CREATE (only for admin)
router.post('/', authorize('admin'), async (req, res) => {
  try {
    const car = await Car.create(req.body);
    mqttClient.publish('cars/created', JSON.stringify(car));
    logger.info(`Car created: ${car.id}`);
    res.status(201).json(car);
  } catch (err) {
    logger.error('Error creating car:', err);
    res.status(400).json({ message: err.message });
  }
});

// READ
router.get('/', async (req, res) => {
  try {
    const cars = await Car.findAll();
    res.json(cars);
  } catch (err) {
    logger.error('Error fetching cars:', err);
    res.status(500).json({ message: err.message });
  }
});

// READ by ID
router.get('/:id', async (req, res) => {
  try {
    const car = await Car.findByPk(req.params.id);
    if (car) {
      if (car.rentedBy) {
        const user = await User.findByPk(car.rentedBy);
        if (!user) {
          // If the user does not exist, mark the car as available and remove the owner
          car.rentedBy = null;
          car.available = true;
          await car.save();
        }
      }
      res.json(car);
    } else {
      res.status(404).json({ message: 'Car not found' });
    }
  } catch (err) {
    logger.error('Error fetching car details:', err);
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
      logger.info(`Car updated: ${car.id}`);
      res.json(car);
    } else {
      res.status(404).json({ message: 'Car not found' });
    }
  } catch (err) {
    logger.error('Error updating car:', err);
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
      logger.info(`Car deleted: ${car.id}`);
      res.json({ message: 'Car deleted successfully' });
    } else {
      res.status(404).json({ message: 'Car not found' });
    }
  } catch (err) {
    logger.error('Error deleting car:', err);
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;