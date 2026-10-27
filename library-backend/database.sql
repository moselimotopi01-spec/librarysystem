CREATE DATABASE IF NOT EXISTS kings_library
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE kings_library;

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  membership_id VARCHAR(60) NOT NULL UNIQUE,
  role ENUM('Admin','Librarian','Membership') NOT NULL DEFAULT 'Membership',
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS books (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  author VARCHAR(150) NOT NULL,
  genre VARCHAR(100) NOT NULL,
  isbn VARCHAR(30) NOT NULL UNIQUE,
  quantity INT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  book_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NULL,
  type ENUM('Stock Added','Borrowed') NOT NULL,
  quantity INT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_transactions_book FOREIGN KEY (book_id) REFERENCES books(id),
  CONSTRAINT fk_transactions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

INSERT IGNORE INTO books (title, author, genre, isbn, quantity) VALUES
('Things Fall Apart', 'Chinua Achebe', 'Fiction', '9780385474542', 5),
('The Alchemist', 'Paulo Coelho', 'Fiction', '9780062315007', 1),
('Clean Code', 'Robert C. Martin', 'Programming', '9780132350884', 4);
