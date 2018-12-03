'use strict';

// dependencies
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');

require ('dotenv').config();

// setup
const PORT = process.env.PORT;
const app = express();

// application middleware
app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));

// set view
app.set('view engine', 'ejs')

//database setup
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));


function handleError(err, res) {
  console.error(err);
  res.render('pages/error', {error: err});
}

//api routes
app.get('/', homePage);
app.get('/book/:bookInfo', getDetail);
app.get('/books/show', getOneBook);
app.get('/new_search', newSearch);
app.get('/books/:add', dbInsert);

app.post('/books', addBook);
app.post('/searches', createSearch);
app.post('/add', addBook);


//catchall
app.get('*', (request, response) => response.status(404).send('You have an error'));

// listener
app.listen(PORT, () => console.log(`Listening on ${PORT}`));

//Helper 
function newSearch (req, res) {
  res.render('pages/searches/new');
}


function dbInsert (req, res) {
  res.render('books/show');
}

function homePage (req, res) {
  let SQL = 'SELECT * FROM books;';

  return client.query(SQL)
    .then(results => {
      res.render('pages/index', {results: results.rows})
    })
    .catch(handleError);
}

function getDetail (req, res) {
  let SQL = 'SELECT * FROM books WHERE id=$1;';
  let values = [req.params.bookInfo];

  return client.query(SQL, values)
    .then( (result) => {
      return res.render('books/detail', {book: result.rows[0]})
    })
    .catch(handleError);
}

function getOneBook (req, res) {
  let SQL = 'SELECT * FROM books WHERE id=$1;';
  let values = [req.params.bookInfo];

  return client.query(SQL, values)
    .then( (result) => {
      return res.render('books/show', {book: result.rows[0]})
    })
    .catch(handleError);
}

function addBook (req, res) {
  let SQL = 'INSERT INTO books (title, author, isbn, image_url, description) VALUES ($1, $2, $3, $4, $5);';
  // console.log('reqbody', req.body);
  let values = [
    req.body.title,
    req.body.author,
    req.body.isbn,
    req.body.image_url,
    req.body.description
  ];
  // console.log('values', values);
  client.query(SQL, values)
    .then(res.redirect('/'))
    .catch(res.redirect('/error'));
 
}

//model
function Book(info) {
  this.title = info.title ? info.title : 'No Data Found' ;
  this.author = info.authors ? info.authors[0] : 'No Data Found' ;
  this.description = info.description ? info.description :  'No Data Found';
  this.image_url = info.imageLinks.thumbnail ? info.imageLinks.thumbnail : 'http://www.lse.ac.uk/International-History/Images/Books/NoBookCover.png' ;
  this.isbn = info.industryIdentifiers[0].identifier ? info.industryIdentifiers[0].identifier :  'No Data Found';
}

function createSearch (req, res) {
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';
  if (req.body.search[1] === 'title') { url += `+intitle:${req.body.search[0]}`; }
  if (req.body.search[1] === 'author') { url += `+inauthor:${req.body.search[0]}`; }

  superagent.get(url)
    .then(apiResponse => apiResponse.body.items.map(bookResult => new Book(bookResult.volumeInfo)))
    .then(results => res.render('pages/searches/show', {searches: results}))
    .catch(error => handleError(error, res));
}
