require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Routes imports
const vehicleRoutes = require('./routes/vehicleRoutes');
const { protect } = require("./middleware/authMiddleware");
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');


const db = new Pool({
  // host: process.env.DB_HOST,
  // user: process.env.DB_USER,
  // password: process.env.DB_PASSWORD,
  // database: process.env.DB_NAME,
  // port: 5432,
   connectionString: process.env.DATABASE_URL,
  
  ssl: { rejectUnauthorized: false }
});

const app = express();
app.use(express.json());

app.use(cors({
  origin: [
    'http://localhost:3000', 
    'https://car-service-fawn-gamma.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// ====== AUTH SIGNUP ======
app.post('/api/auth/signup', async (req, res) => {
  try {
    // Front-end se 'phone' ya 'phone_number' jo bhi aa raha hai use handle karein
    const { name, email, password, phone } = req.body;

    const existingUser = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Agar phone null hai toh empty string ya default value bhejrein taaki DB error na de
    const finalPhone = phone || ""; 

    const newUser = await db.query(
      `INSERT INTO users (name, email, password, phone_number, is_admin) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, name, email, is_admin`,
      [name, email, hashedPassword, finalPhone, false]
    );

    res.status(201).json({ message: "User registered successfully", user: newUser.rows[0] });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// ====== AUTH LOGIN ======
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const userResult = await db.query("SELECT * FROM users WHERE email=$1", [email]);

    if (!userResult.rows.length) return res.status(401).json({ message: "Invalid credentials" });

    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user.id, is_admin: user.is_admin },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({ token, user: { id: user.id, name: user.name, is_admin: user.is_admin } });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Routes middleware
app.use("/api/admin", adminRoutes(db));
app.use("/api/vehicles", protect, vehicleRoutes(db));
app.use("/api/bookings", protect, bookingRoutes(db));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));