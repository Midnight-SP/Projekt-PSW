const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  make: String,
  model: String,
  year: Number,
  available: Boolean,
});

module.exports = mongoose.model('Car', carSchema);