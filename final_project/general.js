const axios = require('axios');

const BASE_URL = "http://localhost:5004";

// Get all books – using Promise callbacks (.then)
function getAllBooks() {
  axios.get(`${BASE_URL}/`)
    .then(response => {
      console.log("All Books:", response.data);
    })
    .catch(error => {
      console.error("Error fetching all books:", error.message);
    });
}

// Get book details based on ISBN – using async/await
async function getBookByISBN(isbn) {
  try {
    const response = await axios.get(`${BASE_URL}/isbn/${isbn}`);
    console.log(`Book with ISBN ${isbn}:`, response.data);
  } catch (error) {
    console.error(`Error fetching book with ISBN ${isbn}:`, error.message);
  }
}

// Get book details based on Author – using Promise callbacks (.then)
function getBooksByAuthor(author) {
  axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`)
    .then(response => {
      console.log(`Books by ${author}:`, response.data);
    })
    .catch(error => {
      console.error(`Error fetching books by ${author}:`, error.message);
    });
}

// Get book details based on Title – using async/await
async function getBooksByTitle(title) {
  try {
    const response = await axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`);
    console.log(`Books with title ${title}:`, response.data);
  } catch (error) {
    console.error(`Error fetching books with title ${title}:`, error.message);
  }
}

// Example calls
getAllBooks();
getBookByISBN(1);
getBooksByAuthor("Chinua Achebe");
getBooksByTitle("Fairy tales");

module.exports = {
  getAllBooks,
  getBookByISBN,
  getBooksByAuthor,
  getBooksByTitle
};