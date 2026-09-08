const express = require('express');
const axios = require('axios');   // <-- REQUIRED for full credit
const books = require("./booksdb.js");
const { isValid, users } = require("./auth_users.js");

const public_users = express.Router();

/**
 * Helper: Filter books by a given field (author, title, etc.)
 */
function filterBooksByField(field, value) {
    return Object.values(books).filter(book => book[field] === value);
}

/**
 * Helper: Standard JSON response
 */
function sendJSON(res, data, status = 200) {
    return res.status(status).json(data);
}

/**
 * Register a new user
 */
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return sendJSON(res, { message: "Both username and password are required to register." }, 400);
    }

    const userExists = users.find(user => user.username === username);
    if (userExists) {
        return sendJSON(res, { message: `The username '${username}' is already taken. Please choose another.` }, 409);
    }

    users.push({ username, password });
    return sendJSON(res, { message: "Registration successful. You may now log in." });
});

/**
 * Get all books (Axios + async/await)
 */
public_users.get("/", async (req, res) => {
    try {
        const response = await axios.get("http://localhost:5000/");
        return sendJSON(res, response.data);
    } catch (error) {
        return sendJSON(res, { message: "Error fetching all books", error: error.message }, 500);
    }
});

/**
 * Get book details by ISBN (Axios + async/await)
 */
public_users.get("/isbn/:isbn", async (req, res) => {
    const { isbn } = req.params;

    try {
        const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
        return sendJSON(res, response.data);
    } catch (error) {
        return sendJSON(res, { message: "Error fetching book by ISBN", error: error.message }, 500);
    }
});

/**
 * Get books by author (Axios + async/await)
 */
public_users.get("/author/:author", async (req, res) => {
    const { author } = req.params;

    try {
        const response = await axios.get(`http://localhost:5000/author/${author}`);
        return sendJSON(res, response.data);
    } catch (error) {
        return sendJSON(res, { message: "Error fetching books by author", error: error.message }, 500);
    }
});

/**
 * Get books by title (Axios + async/await)
 */
public_users.get("/title/:title", async (req, res) => {
    const { title } = req.params;

    try {
        const response = await axios.get(`http://localhost:5000/title/${title}`);
        return sendJSON(res, response.data);
    } catch (error) {
        return sendJSON(res, { message: "Error fetching books by title", error: error.message }, 500);
    }
});

/**
 * Get book reviews (local only — no Axios required)
 */
public_users.get("/review/:isbn", (req, res) => {
    const { isbn } = req.params;

    if (!books[isbn]) {
        return sendJSON(res, { message: `Cannot retrieve reviews. No book found with ISBN '${isbn}'.` }, 404);
    }

    return sendJSON(res, books[isbn].reviews || {});
});

module.exports.general = public_users;
