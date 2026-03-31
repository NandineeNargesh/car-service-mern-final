const express = require('express');
const { protect, isAdmin } = require('../middleware/authMiddleware'); // <--- Dono import karein

module.exports = (db) => {
  const router = express.Router();

  // 1. GET Admin Stats
  router.get('/stats', protect, isAdmin, async (req, res) => {
    try {
      const stats = await db.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status IN ('Booking Confirmed', 'Vehicle Dropped Off', 'Service In Progress')) as active,
          COUNT(*) FILTER (WHERE status = 'Ready for Pickup') as ready,
          COUNT(*) FILTER (WHERE status = 'Service Completed') as completed
        FROM bookings
      `);
      res.json(stats.rows[0]);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // 2. GET All Bookings
  router.get('/bookings', protect, isAdmin, async (req, res) => {
    try {
      const result = await db.query(
        `SELECT b.id, b.service_type, b.booking_date, b.time_slot, b.status,
                u.name as user_name, u.email, 
                v.make, v.model, v.registration_number
         FROM bookings b
         LEFT JOIN users u ON b.user_id = u.id
         LEFT JOIN vehicles v ON b.vehicle_id = v.id
         ORDER BY b.booking_date DESC`
      );
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ message: "Database Error" });
    }
  });

  // 3. PUT Update Status
  router.put('/bookings/:id/status', protect, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
      await db.query("UPDATE bookings SET status = $1 WHERE id = $2", [status, id]);
      res.json({ message: "Status updated successfully" });
    } catch (err) {
      res.status(500).json({ message: "Failed to update status" });
    }
  });

  return router;
};