require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); // Postgres ki jagah Mongoose
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Models Import
const User = require('./models/User'); 

// Routes imports
const vehicleRoutes = require('./routes/vehicleRoutes');
const { protect } = require("./middleware/authMiddleware");
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
app.use(express.json());

// ====== Database Connection ======
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully! ✅"))
  .catch(err => console.error("MongoDB Connection Error: ❌", err));

// ====== CORS Setup ======
app.use(cors({
  origin: '*', // Production ke liye easy rakhte hain
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ====== AUTH SIGNUP (MongoDB Version) ======
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Password Hashing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create New User in Mongo
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone_number: phone || "",
      is_admin: false
    });

    await newUser.save();

    res.status(201).json({ 
      message: "User registered successfully", 
      user: { id: newUser._id, name, email } 
    });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// ====== AUTH LOGIN (MongoDB Version) ======
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user in Mongo
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    // Compare Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    // Create Token (Mongo uses _id)
    const token = jwt.sign(
      { userId: user._id, is_admin: user.is_admin },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({ 
      token, 
      user: { id: user._id, name: user.name, is_admin: user.is_admin } 
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ====== Routes middleware ======
// Note: Ab hum 'db' pass nahi karenge kyunki models andar use honge
app.use("/api/admin", adminRoutes); 
app.use("/api/vehicles", protect, vehicleRoutes);
app.use("/api/bookings", protect, bookingRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));