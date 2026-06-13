const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');

const app = express();
app.use(express.json());

// Session setup
app.use(session({
  secret: "fingerprint_customer",
  resave: true,
  saveUninitialized: true
}));

// JWT Middleware
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, "secret_key", (err, user) => {
      if (err) {
        return res.status(403).json({
          message: "Invalid token"
        });
      }

      req.user = user;
      next();
    });
  } else {
    return res.status(401).json({
      message: "Authentication required"
    });
  }
};

// Import routers
const public_users = require('./router/general.js').general;
const regd_users = require('./router/auth_users.js').authenticated;

// Public routes
app.use("/", public_users);

// Customer routes
app.use("/customer", regd_users);

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});