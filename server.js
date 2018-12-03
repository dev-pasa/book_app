'use strict';

// Application Dependencies
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');

// Application Setup
const app = express();
const PORT = process.env.PORT || 4000;

//DataBase Setup
const client = new pg.Client('postgres://localhost:5432/book_app');
client.connect();
client.on('error', err => console.error(err));



// Application Middleware
app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));

// Set the view engine for server-side templating
app.set('view engine', 'ejs');

// API Routes
app.get('/', getBooks); //Gets API book information
app.get('/', newSearch); // Renders the search form
app.post('/searches', createSearch); // Creates a new search to the Google Books API
app.post('/books', addBookToDB);
app.get('/books/:id', getBook);


app.get('*', (request, response) => response.status(404).send('This route does not exist')); // Catch-all

app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));

// HELPER FUNCTIONS
// Only show part of this to get students started
// function Book(info) {
//   // const placeholderImage = 'https://i.imgur.com/J5LVHEL.jpg';

//   this.title = info.title || 'No title available';

// }

function Book(info) {
  this.title = info.title;
  this.picture = info.imageLinks.thumbnail;
  this.author = info.authors[0];
  this.description = info.description;

  this.bookshelf = info.categories;
  this.isbn = info.industryIdentifiers ? `${info.industryIdentifiers[0].identifier}` : '';
}
 function getBooks(request, response) {
   let SQL = 'SELECT * FROM books';

   return client.query(SQL) 
    .then(results => {
      if(results.row.rowCount === 0) {
        response.render('pages/searches/new');
    } else {
        response.render('pages/index', {books: results.rows})
    }
   })
   .catch(err => handleError(err, response));


function createSearch(request, response) {
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';

  if (request.body.search[1] === 'title') { url += `+intitle:${request.body.search[0]}`; }
  if (request.body.search[1] === 'author') { url += `+inauthor:${request.body.search[0]}`; }

  superagent.get(url)
    .then(apiResponse => apiResponse.body.items.map(bookResult => new Book(bookResult.volumeInfo)))
    .then(results => response.render('pages/searches/show', {searchResults: results}))
    // how will we handle errors?
    .catch(err => handleError(err, response));
}

// Note that .ejs file extension is not required
function newSearch(request, response) {
  response.render('pages/searches/new');
}

function addBookToDB(request, response) {
  let normalizedShelf = request.body.bookshelf.toLowerCase();

  let SQL = 'INSERT INTO books(title, author, isbn, picture, description, bookshelf) VALUES($1, $2, $3, $4, $5, $6);';
  let values = [title, author, isbn, picture, description, normalizedShelf];

  return 
}




function handleError(error, response) {
  response.render('pages/error', {error: error});
}