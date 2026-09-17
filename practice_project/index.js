const express = require("express");
const session = require("express-session");
const jwt = require("jsonwebtoken");

const customerRoutes = require("./router/auth_users").authenticated;
const generalRoutes = require("./router/general").general;
const books = require("./router/booksdb");

const app = express();
const PORT = 5000;
const JWT_SECRET = process.env.JWT_SECRET || "book-review-jwt-secret";

app.use(express.json());

app.use(
  "/customer",
  session({
    secret: process.env.SESSION_SECRET || "fingerprint_customer",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax"
    }
  })
);

// JWT authentication middleware.
// This runs only for protected /customer/auth/* routes.
app.use("/customer/auth/*", (req, res, next) => {
  const authorization = req.session.authorization;

  if (!authorization || !authorization.accessToken) {
    return res.status(401).json({
      message: "User is not authenticated"
    });
  }

  try {
    const decoded = jwt.verify(authorization.accessToken, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
});

/*
 * Internal endpoints used only by general.js for Tasks 10-13.
 * The public routes call these with Axios so the async/await + Axios
 * requirement is demonstrated without creating a recursive request.
 */
app.get("/_internal/books", (req, res) => {
  res.json(books);
});

app.get("/_internal/books/isbn/:isbn", (req, res) => {
  const book = books[req.params.isbn];
  res.json(book || null);
});

app.get("/_internal/books/author/:author", (req, res) => {
  const author = req.params.author.toLowerCase();
  const matches = Object.values(books).filter(
    (book) => book.author.toLowerCase() === author
  );
  res.json(matches);
});

app.get("/_internal/books/title/:title", (req, res) => {
  const title = req.params.title.toLowerCase();
  const matches = Object.values(books).filter(
    (book) => book.title.toLowerCase() === title
  );
  res.json(matches);
});

app.use("/customer", customerRoutes);
app.use("/", generalRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

module.exports = app;
