const express = require('express');
const { protect } = require('../middleware/authMiddleware');

const createBookingRoutes = (db) => {
  const router = express.Router();

  router.post('/create', protect, async (req, res) => {
    try {
      const { vehicle_id, service_type, booking_date, time_slot } = req.body;
      await db.query(
        'INSERT INTO bookings (user_id, vehicle_id, service_type, booking_date, time_slot) VALUES ($1, $2, $3, $4, $5)',
        [req.userId, vehicle_id, service_type, booking_date, time_slot]
      );
      res.status(201).json({ message: 'Booking created successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Booking failed' });
    }
  });

  router.get('/history', protect, async (req, res) => {
  try {
    // Console log lagayein taaki terminal mein dikhe data aa raha hai ya nahi
    console.log("Fetching history for User ID:", req.userId);

    const result = await db.query(
      `SELECT 
        b.id, 
        b.service_type, 
        b.booking_date, 
        b.time_slot, 
        COALESCE(b.status, 'Pending') as status, 
        v.make, 
        v.model
       FROM bookings b
       LEFT JOIN vehicles v ON b.vehicle_id = v.id
       WHERE b.user_id = $1
       ORDER BY b.booking_date DESC`,
      [req.userId]
    );

    console.log("Bookings found in DB:", result.rows.length);
    res.json(result.rows);
  } catch (err) {
    console.error("HISTORY API ERROR:", err.message);
    res.status(500).json({ message: 'Error fetching history' });
  }
});
  return router;
};

// Fixed the space issue here:
module.exports = createBookingRoutes;