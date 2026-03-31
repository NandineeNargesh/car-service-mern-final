const express = require("express");

module.exports = (db) => {
  const router = express.Router();

  // GET: Fetch user's vehicles
  router.get("/", async (req, res) => {
    try {
      const result = await db.query(
        "SELECT * FROM vehicles WHERE user_id = $1",
        [req.userId]
      );
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });

  // POST: Add new vehicle
  router.post("/add", async (req, res) => {
    const { make, model, registration_number } = req.body;
    const userId = req.userId;

    try {
      const exists = await db.query("SELECT id FROM vehicles WHERE registration_number = $1", [registration_number]);
      if (exists.rows.length > 0) {
        return res.status(400).json({ message: "Vehicle already exists" });
      }

      await db.query(
        "INSERT INTO vehicles (user_id, make, model, registration_number) VALUES ($1, $2, $3, $4)",
        [userId, make, model, registration_number]
      );
      res.status(201).json({ message: "Vehicle added successfully" });
    } catch (err) {
      res.status(500).json({ message: "Database error" });
    }
  });

  // PUT: Update vehicle
  router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { make, model, registration_number } = req.body;
    try {
      const result = await db.query(
        "UPDATE vehicles SET make = $1, model = $2, registration_number = $3 WHERE id = $4 AND user_id = $5 RETURNING *",
        [make, model, registration_number, id, req.userId]
      );
      if (result.rows.length === 0) return res.status(404).json({ message: "Not found" });
      res.json({ message: "Updated", vehicle: result.rows[0] });
    } catch (err) {
      res.status(500).json({ message: "Update failed" });
    }
  });

  // DELETE: Remove vehicle
  router.delete("/:id", async (req, res) => {
    try {
      const result = await db.query(
        "DELETE FROM vehicles WHERE id = $1 AND user_id = $2 RETURNING *",
        [req.params.id, req.userId]
      );
      if (result.rows.length === 0) return res.status(404).json({ message: "Not found" });
      res.json({ message: "Deleted" });
    } catch (err) {
      res.status(500).json({ message: "Delete failed" });
    }
  });

  return router;
};