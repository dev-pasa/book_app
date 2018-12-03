DROP TABLE IF EXISTS books;

  CREATE TABLE IF NOT EXISTS books ( 
    id SERIAL PRIMARY KEY,
    author VARCHAR(100),
    title VARCHAR(155),
    isbn VARCHAR(30),
    image_url VARCHAR(255),
    description TEXT,
    bookshelf VARCHAR(30)
  );


INSERT INTO books (title, author, isbn, image_url, description, bookshelf) 
VALUES(
    'Dune', 'Frank Herbert', 'ISBN_13 9780441013593',
    'http://books.google.com/books/content?id=B1hSG45JCX4C&printsec=frontcover&img=1&zoom=5&edge=curl&source=gbs_api' ,'Follows the adventures of Paul Atreides, the son of a betrayed duke given up for dead on a treacherous desert planet and adopted by its fierce, nomadic people, who help him unravel his most unexpected destiny.' , 'documentary'
  );