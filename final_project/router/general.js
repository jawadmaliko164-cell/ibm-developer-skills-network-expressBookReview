const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (username && password) {
    if (!isValid(username)) {
      users.push({ username, password });
      return res.status(200).json({ message: "User registered successfully." });
    } else {
      return res.status(400).json({ message: "Username already exists." });
    }
  } else {
    return res.status(400).json({ message: "Username and password are required." });
  }
});

// Tarefa 10: Obter a lista de livros disponíveis no servidor usando Async/Await
public_users.get('/', async function (req, res) {
  try {
    const getBooks = () => {
      return new Promise((resolve) => {
        resolve(books);
      });
    };
    const bookList = await getBooks();
    return res.status(200).send(JSON.stringify(bookList, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Error fetching book list" });
  }
});

// Tarefa 11: Obter detalhes do livro com base no ISBN usando Promises
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  
  const getBookByISBN = new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject("Book not found");
    }
  });

  getBookByISBN
    .then((book) => {
      return res.status(200).send(JSON.stringify(book, null, 4));
    })
    .catch((err) => {
      return res.status(404).json({ message: err });
    });
});

// Tarefa 12: Obter detalhes dos livros com base no autor usando Async/Await
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;

  try {
    const getBooksByAuthor = () => {
      return new Promise((resolve) => {
        const filteredBooks = Object.values(books).filter(
          book => book.author.toLowerCase() === author.toLowerCase()
        );
        resolve(filteredBooks);
      });
    };

    const filteredBooks = await getBooksByAuthor();
    if (filteredBooks.length > 0) {
      return res.status(200).send(JSON.stringify(filteredBooks, null, 4));
    } else {
      return res.status(404).json({ message: "No books found by this author" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books by author" });
  }
}); 

// Tarefa 13: Obter detalhes dos livros com base no título usando Promises
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;

  const getBooksByTitle = new Promise((resolve, reject) => {
    const filteredBooks = Object.values(books).filter(
      book => book.title.toLowerCase() === title.toLowerCase()
    );
    if (filteredBooks.length > 0) {
      resolve(filteredBooks);
    } else {
      reject("No books found with this title");
    }
  });

  getBooksByTitle
    .then((filteredBooks) => {
      return res.status(200).send(JSON.stringify(filteredBooks, null, 4));
    })
    .catch((err) => {
      return res.status(404).json({ message: err });
    });
});

// Obter resenhas de um livro
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;