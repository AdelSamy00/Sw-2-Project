const router = require('express').Router();
const conn = require('../config/connection');
const adminAuth = require('../middlewares/admin');
const auther = require('../middlewares/auther');
const Book = require('../model/Book');

const book = new Book();
router.get('/', async function (req, res) {
  const books = await book.getAllBooks();
  //console.log(books);
  if (books.length == 0) {
    res.status(404).json({ message: 'Not found any books!' });
  } else {
    res
      .status(200)
      .json({ message: 'Get all books successfully.', data: books });
  }
});

router.post('/add-new-book', auther, adminAuth, async function (req, res) {
  try {
    const bookData = req.body;
    await book.addNewBook(bookData, res);
  } catch (error) {
    console.log(error);
    throw error;
  }
});

router.get('/book-by-ISBN', async (req, res) => {
  try {
    const { ISBN } = req.body;
    console.log(ISBN);
    const bookData = await book.getBookByISBN(ISBN);
    if (bookData.length > 0) {
      res.status(200).json({ message: 'found', data: bookData });
    } else {
      res.status(404).json({ message: 'book is not found.' });
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

module.exports = router;
