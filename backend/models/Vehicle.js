const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  make: { type: String, required: true },
  model: { type: String, required: true },
  registration_number: { type: String, required: true, unique: true }
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);