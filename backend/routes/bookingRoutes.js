const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const { protect } = require('../middleware/authMiddleware');

router.post('/create', protect, async (req, res) => {
  try {
    const { vehicle_id, service_type, booking_date, time_slot } = req.body;
    const newBooking = new Booking({
      user_id: req.userId,
      vehicle_id,
      service_type,
      booking_date,
      time_slot
    });
    await newBooking.save();
    res.status(201).json({ message: 'Booking created successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Booking failed' });
  }
});

router.get('/history', protect, async (req, res) => {
  try {
    // MongoDB mein populate SQL JOIN jaisa kaam karta hai
    const bookings = await Booking.find({ user_id: req.userId })
                                  .populate('vehicle_id', 'make model')
                                  .sort({ booking_date: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching history' });
  }
});

module.exports = router;