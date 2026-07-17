const Axios = require("axios");
const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// ==========================================
// TASK 6: Đăng ký người dùng mới (Register)
// ==========================================
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    const present = users.filter((user) => user.username === username);
    if (present.length === 0) {
      users.push({ "username": username, "password": password });
      return res.status(201).json({ message: "User created successfully" });
    } else {
      return res.status(400).json({ message: "Username already exists" });
    }
  } else if (!username && !password) {
    return res.status(400).json({ message: "Bad request: Username and password are required" });
  } else {
    return res.status(400).json({ message: "Check username and password fields" });
  }
});

// ==========================================
// TASK 1: Lấy danh sách tất cả sách (Get all books) - Dùng Promise
// ==========================================
public_users.get('/', (req, res) => {
  const getBooks = () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(books);
      }, 1000);
    });
  };

  getBooks()
    .then((booksList) => {
      res.send(JSON.stringify(booksList, null, 4));
    })
    .catch((err) => {
      res.status(500).json({ error: "An error occurred while fetching books" });
    });
});

// ==========================================
// TASK 2: Lấy thông tin sách theo ISBN - Dùng Promise
// ==========================================
public_users.get('/isbn/:isbn', (req, res) => {
  const ISBN = req.params.isbn;

  const booksBasedOnIsbn = (isbnKey) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const book = books[isbnKey]; // Vì books là Object, truy cập trực tiếp bằng key (ISBN)
        if (book) {
          resolve(book);
        } else {
          reject(new Error("Book not found"));
        }
      }, 1000);
    });
  };

  booksBasedOnIsbn(ISBN)
    .then((book) => {
      res.send(JSON.stringify(book, null, 4));
    })
    .catch((err) => {
      res.status(404).json({ error: "Book not found with this ISBN" });
    });
});

// ==========================================
// TASK 3: Lấy thông tin sách theo Author - Dùng Promise
// ==========================================
public_users.get('/author/:author', (req, res) => {
  const author = req.params.author;

  const booksBasedOnAuthor = (auth) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const keys = Object.keys(books);
        const filteredBooks = [];

        keys.forEach((key) => {
          if (books[key].author.toLowerCase() === auth.toLowerCase()) {
            filteredBooks.push({
              isbn: key,
              title: books[key].title,
              reviews: books[key].reviews
            });
          }
        });

        if (filteredBooks.length > 0) {
          resolve(filteredBooks);
        } else {
          reject(new Error("No books found by this author"));
        }
      }, 1000);
    });
  };

  booksBasedOnAuthor(author)
    .then((resultBooks) => {
      res.send(JSON.stringify(resultBooks, null, 4));
    })
    .catch((err) => {
      res.status(404).json({ error: err.message });
    });
});

// ==========================================
// TASK 4: Lấy thông tin sách theo Title - Dùng Promise
// ==========================================
public_users.get('/title/:title', (req, res) => {
  const title = req.params.title;

  const booksBasedOnTitle = (booktitle) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const keys = Object.keys(books);
        const filteredBooks = [];

        keys.forEach((key) => {
          if (books[key].title.toLowerCase() === booktitle.toLowerCase()) {
            filteredBooks.push({
              isbn: key,
              author: books[key].author,
              reviews: books[key].reviews
            });
          }
        });

        if (filteredBooks.length > 0) {
          resolve(filteredBooks);
        } else {
          reject(new Error("No books found with this title"));
        }
      }, 1000);
    });
  };

  booksBasedOnTitle(title)
    .then((resultBooks) => {
      res.send(JSON.stringify(resultBooks, null, 4));
    })
    .catch((err) => {
      res.status(404).json({ error: err.message });
    });
});

// ==========================================
// TASK 5: Lấy danh sách đánh giá (Reviews) theo ISBN
// ==========================================
public_users.get('/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    // Sửa 'review' thành 'reviews' cho khớp cấu trúc database mẫu
    return res.send(JSON.stringify(book.reviews, null, 4));
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
// =================================================================
// TASKS 10-13: SỬ DỤNG AXIOS (PROMISES / ASYNC-AWAIT)
// =================================================================

// Task 10: Lấy danh sách tất cả sách sử dụng Async-Await với Axios
public_users.get('/axios/books', async (req, res) => {
    try {
      // Gọi API gốc bằng Axios thông qua async-await
      const response = await Axios.get('http://localhost:5000/');
      return res.status(200).json(response.data);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching book list", error: error.message });
    }
  });
  
  // Task 11: Lấy chi tiết sách theo ISBN sử dụng Promise với Axios
  public_users.get('/axios/isbn/:isbn', (req, res) => {
    const isbn = req.params.isbn;
    
    // Gọi API gốc bằng Axios thông qua Promise (.then / .catch)
    Axios.get(`http://localhost:5000/isbn/${isbn}`)
      .then((response) => {
        return res.status(200).json(response.data);
      })
      .catch((error) => {
        return res.status(404).json({ message: "Book not found", error: error.message });
      });
  });
  
  // Task 12: Lấy chi tiết sách theo Author sử dụng Async-Await với Axios
  public_users.get('/axios/author/:author', async (req, res) => {
    const author = req.params.author;
    try {
      // Gọi API gốc bằng Axios thông qua async-await
      const response = await Axios.get(`http://localhost:5000/author/${author}`);
      return res.status(200).json(response.data);
    } catch (error) {
      return res.status(404).json({ message: "Books by this author not found", error: error.message });
    }
  });
  
  // Task 13: Lấy chi tiết sách theo Title sử dụng Promise với Axios
  public_users.get('/axios/title/:title', (req, res) => {
    const title = req.params.title;
    
    // Gọi API gốc bằng Axios thông qua Promise (.then / .catch)
    Axios.get(`http://localhost:5000/title/${title}`)
      .then((response) => {
        return res.status(200).json(response.data);
      })
      .catch((error) => {
        return res.status(404).json({ message: "Book with this title not found", error: error.message });
      });
  });