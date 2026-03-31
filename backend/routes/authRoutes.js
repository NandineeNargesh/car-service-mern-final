
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = (pool) => {
  const router = express.Router();

  /* -------- REGISTER -------- */
  router.post("/register", async (req, res) => {
    try {
      const { name, email, phone_number, password } = req.body;

      if (!name || !email || !phone_number || !password) {
        return res.status(400).json({ message: "Please provide all fields" });
      }

      // Check if user exists
      const existingUser = await pool.query(
        "SELECT id FROM users WHERE email = $1",
        [email]
      );

      if (existingUser.rows.length > 0) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user (normal users default is_admin = FALSE)
      const result = await pool.query(
        `INSERT INTO users (name, email, phone_number, password, is_admin)
         VALUES ($1, $2, $3, $4, FALSE)
         RETURNING id, name, email, is_admin`,
        [name, email, phone_number, hashedPassword]
      );

      res.status(201).json({
        message: "User registered successfully",
        user: result.rows[0],
      });
    } catch (err) {
      console.error("REGISTER ERROR:", err);
      res.status(500).json({ message: "Server error" });
    }
  });

  /* -------- LOGIN -------- */
  router.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      const userResult = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
      );

      if (userResult.rows.length === 0) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const user = userResult.rows[0];
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          name: user.name,
          is_admin: user.is_admin, // important for admin detection
        },
        process.env.JWT_SECRET || "fallback_secret_key",
        { expiresIn: "1h" }
      );

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          is_admin: user.is_admin,
        },
      });
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      res.status(500).json({ message: "Server error" });
    }
  });

  return router;
};
