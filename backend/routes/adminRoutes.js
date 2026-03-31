const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const { protect, isAdmin } = require('../middleware/authMiddleware');

router.get('/stats', protect, isAdmin, async (req, res) => {
  try {
    const total = await Booking.countDocuments();
    const active = await Booking.countDocuments({ status: { $in: ['Booking Confirmed', 'Vehicle Dropped Off', 'Service In Progress'] } });
    const ready = await Booking.countDocuments({ status: 'Ready for Pickup' });
    const completed = await Booking.countDocuments({ status: 'Service Completed' });

    res.json({ total, active, ready, completed });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

router.get('/bookings', protect, isAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user_id', 'name email')
      .populate('vehicle_id', 'make model registration_number')
      .sort({ booking_date: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Database Error" });
  }
});

router.put('/bookings/:id/status', protect, isAdmin, async (req, res) => {
  try {
    await Booking.findByIdAndUpdate(req.params.id, { status: req.body.status });
    res.json({ message: "Status updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to update status" });
  }
});

module.exports = router;