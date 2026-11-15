const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');
const BASE_URL = 'http://localhost:5000';

// Get all books (async/await with Axios)
const getAllBooks = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/`);
    return response.data;
  } catch (error) {
    throw new Error("Error fetching books: " + error.message);
  }
};

// Get book by ISBN (Promise callbacks with Axios)
const getBookByISBN = (isbn) => {
  return axios.get(`${BASE_URL}/isbn/${isbn}`)
    .then(response => response.data)
    .catch(error => { throw new Error("Error fetching book: " + error.message); });
};

// Get books by author (async/await with Axios)
const getBooksByAuthor = async (author) => {
  try {
    const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`);
    return response.data;
  } catch (error) {
    throw new Error("Error fetching books by author: " + error.message);
  }
};

// Get books by title (async/await with Axios)
const getBooksByTitle = async (title) => {
  try {
    const response = await axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`);
    return response.data;
  } catch (error) {
    throw new Error("Error fetching books by title: " + error.message);
  }
};

public_users.post("/register", (req,res) => {
  //Write your code here
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (users.some(u => u.username === username)) {
    return res.status(409).json({ message: "User already exists" });
  }
  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).send(JSON.stringify(books[isbn], null, 4));
  }
  return res.status(404).json({ message: "Book not found" });
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Write your code here
  const author = req.params.author.toLowerCase();
  const result = Object.keys(books)
    .filter(key => books[key].author.toLowerCase() === author)
    .map(key => ({ isbn: key, ...books[key] }));
  if (result.length > 0) {
    return res.status(200).send(JSON.stringify({ booksbyauthor: result }, null, 4));
  }
  return res.status(404).json({ message: "No books found for this author" });
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  const title = req.params.title.toLowerCase();
  const result = Object.keys(books)
    .filter(key => books[key].title.toLowerCase() === title)
    .map(key => ({ isbn: key, ...books[key] }));
  if (result.length > 0) {
    return res.status(200).send(JSON.stringify({ booksbytitle: result }, null, 4));
  }
  return res.status(404).json({ message: "No books found with this title" });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
  }
  return res.status(404).json({ message: "Book not found" });
});
// Axios routes
public_users.get('/async/books', async (req, res) => {
  try {
    return res.status(200).json(await getAllBooks());
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

public_users.get('/async/isbn/:isbn', (req, res) => {
  getBookByISBN(req.params.isbn)
    .then(data => res.status(200).json(data))
    .catch(err => res.status(500).json({ message: err.message }));
});

public_users.get('/async/author/:author', async (req, res) => {
  try {
    return res.status(200).json(await getBooksByAuthor(req.params.author));
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

public_users.get('/async/title/:title', async (req, res) => {
  try {
    return res.status(200).json(await getBooksByTitle(req.params.title));
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});
module.exports.general = public_users;
