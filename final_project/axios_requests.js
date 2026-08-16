const axios = require('axios');
const baseURL = 'http://localhost:5000';

// Method 1: Get all books using Async/Await
const getAllBooks = async () => {
    try {
        const response = await axios.get(`${baseURL}/`);
        console.log("All Books:", response.data);
    } catch (error) {
        console.error("Error fetching all books:", error);
    }
};

// Method 2: Get book by ISBN using Promises
const getBookByISBN = (isbn) => {
    axios.get(`${baseURL}/isbn/${isbn}`)
        .then(response => {
            console.log(`Book with ISBN ${isbn}:`, response.data);
        })
        .catch(error => {
            console.error("Error fetching book by ISBN:", error);
        });
};

// Method 3: Get books by Author using Async/Await
const getBooksByAuthor = async (author) => {
    try {
        const response = await axios.get(`${baseURL}/author/${author}`);
        console.log(`Books by ${author}:`, response.data);
    } catch (error) {
        console.error("Error fetching books by author:", error);
    }
};

// Method 4: Get books by Title using Promises
const getBooksByTitle = (title) => {
    axios.get(`${baseURL}/title/${title}`)
        .then(response => {
            console.log(`Book with title ${title}:`, response.data);
        })
        .catch(error => {
            console.error("Error fetching book by title:", error);
        });
};

// Execute functions
getAllBooks();
getBookByISBN(1);
getBooksByAuthor('Chinua Achebe');
getBooksByTitle('Fairy tales');
