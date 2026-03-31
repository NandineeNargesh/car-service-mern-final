const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Model import karein

// 1. Sabse pehle login check karne ke liye (Protect Route)
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // Token nikaalein
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // User ko database mein check karein (Extra Security)
      const user = await User.findById(decoded.userId).select("-password");
      
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Request mein data set karein taaki routes ise use kar sakein
      req.userId = user._id;
      req.is_admin = user.is_admin;

      next();
    } catch (err) {
      console.error("Token Error:", err);
      res.status(401).json({ message: "Invalid or expired token" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "No token provided, access denied" });
  }
};

// 2. Admin check karne ke liye
const isAdmin = (req, res, next) => {
  // Dhyan dein: req.is_admin upar 'protect' middleware mein set ho chuka hai
  if (req.is_admin === true) {
    next();
  } else {
    res.status(403).json({ message: "Admin access denied. Admins only!" });
  }
};

module.exports = { protect, isAdmin };