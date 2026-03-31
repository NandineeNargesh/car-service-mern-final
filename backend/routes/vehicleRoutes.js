const express = require("express");
const router = express.Router();
const Vehicle = require("../models/Vehicle");

// GET: Fetch user's vehicles
router.get("/", async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ user_id: req.userId });
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST: Add new vehicle
router.post("/add", async (req, res) => {
  const { make, model, registration_number } = req.body;
  try {
    const exists = await Vehicle.findOne({ registration_number });
    if (exists) return res.status(400).json({ message: "Vehicle already exists" });

    const newVehicle = new Vehicle({ user_id: req.userId, make, model, registration_number });
    await newVehicle.save();
    res.status(201).json({ message: "Vehicle added successfully" });
  } catch (err) {
    res.status(500).json({ message: "Database error" });
  }
});

// DELETE: Remove vehicle
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Vehicle.findOneAndDelete({ _id: req.params.id, user_id: req.userId });
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
});

module.exports = router; // Ab (db) pass karne ki zaroorat nahi