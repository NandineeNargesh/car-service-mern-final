const jwt = require("jsonwebtoken");

// Sabse pehle login check karne ke liye
const protect = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Yahan hum variables set kar rahe hain
    req.userId = decoded.userId;
    req.is_admin = decoded.is_admin; 
    
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Admin check karne ke liye
const isAdmin = (req, res, next) => {
  // Dhyan dein: req.is_admin use kar rahe hain jo upar set hua
  if (req.is_admin === true) {
    next();
  } else {
    res.status(403).json({ message: "Admin access denied. Admins only!" });
  }
};

module.exports = { protect, isAdmin };