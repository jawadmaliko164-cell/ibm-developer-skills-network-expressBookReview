const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Hàm kiểm tra xem username đã tồn tại chưa
const isValid = (username)=>{ 
  let userswithsamename = users.filter((user)=>{
    return user.username === username
  });
  if(userswithsamename.length > 0){
    return true;
  } else {
    return false;
  }
}

// Hàm kiểm tra xem username và password có khớp không
const authenticatedUser = (username,password)=>{ 
  let validusers = users.filter((user)=>{
    return (user.username === username && user.password === password)
  });
  if(validusers.length > 0){
    return true;
  } else {
    return false;
  }
}

// ==========================================
// TASK 7: Đăng nhập (Login) làm thành viên
// ==========================================
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({message: "Error logging in: Missing credentials"});
  }

  if (authenticatedUser(username, password)) {
    // Tạo JWT Token có thời hạn 1 giờ
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    // Lưu token và username vào session
    req.session.authorization = {
      accessToken, username
    }
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({message: "Invalid Login. Check username and password"});
  }
});

// ==========================================
// TASK 8: Thêm hoặc Sửa đánh giá (Add/Modify Review)
// ==========================================
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review; // Lấy review từ query parameter (?review=...)
  const username = req.session.authorization.username; // Lấy username từ session đã lưu khi login

  if (!review) {
    return res.status(400).json({message: "Review content is required"});
  }

  if (books[isbn]) {
    let book = books[isbn];
    
    // Thêm hoặc cập nhật review của user hiện tại cho cuốn sách này
    book.reviews[username] = review;
    
    return res.status(200).json({message: `The review for the book with ISBN ${isbn} has been added/updated.`});
  } else {
    return res.status(404).json({message: "Book not found"});
  }
});

// ==========================================
// TASK 9: Xóa đánh giá (Delete Review) của chính mình
// ==========================================
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username; // Lấy username từ session

  if (books[isbn]) {
    let book = books[isbn];
    
    // Kiểm tra xem user hiện tại đã từng review sách này chưa
    if (book.reviews[username]) {
      delete book.reviews[username]; // Xóa review của chính user đó
      return res.status(200).json({message: `Reviews for the ISBN ${isbn} posted by the user ${username} have been deleted.`});
    } else {
      return res.status(404).json({message: "You have not reviewed this book yet"});
    }
  } else {
    return res.status(404).json({message: "Book not found"});
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;