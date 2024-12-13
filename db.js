const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Ошибка подключения к базе данных:', err.message);
    } else {
        console.log('Подключение к базе данных SQLite успешно установлено.');
    }
});

db.serialize(() => {
	// Таблица статусов книг
	db.run(`
		CREATE TABLE IF NOT EXISTS status (
				status_id INTEGER PRIMARY KEY,
				status_name TEXT NOT NULL
		)
	`);

	// Таблица жанров книг
	db.run(`
		CREATE TABLE IF NOT EXISTS genre (
				genre_id INTEGER PRIMARY KEY,
				genre_name TEXT NOT NULL
		)
	`);

	// Таблица авторов
	db.run(`
		CREATE TABLE IF NOT EXISTS author (
				author_id INTEGER PRIMARY KEY,
				first_name TEXT NOT NULL,
				last_name TEXT NOT NULL,
				patronymic_name TEXT
		)
	`);

	// Таблица книг
	db.run(`
		CREATE TABLE IF NOT EXISTS book (
				book_id INTEGER PRIMARY KEY,
				title TEXT NOT NULL,
				publication_year INTEGER,
				status_id INTEGER,
				genre_id INTEGER,
				author_id INTEGER,
				FOREIGN KEY (status_id) REFERENCES status (status_id),
				FOREIGN KEY (genre_id) REFERENCES genre (genre_id),
				FOREIGN KEY (author_id) REFERENCES author (author_id)
		)
	`);

	// Таблица читателей
	db.run(`
		CREATE TABLE IF NOT EXISTS reader (
				reader_id INTEGER PRIMARY KEY,
				first_name TEXT NOT NULL,
				last_name TEXT NOT NULL,
				patronymic_name TEXT,
				phone_number TEXT,
				email TEXT,
				address TEXT
		)
	`);

	// Таблица читательских билетов
	db.run(`
		CREATE TABLE IF NOT EXISTS card (
				card_id INTEGER PRIMARY KEY,
				reader_id INTEGER,
				librarian_id INTEGER,
				issue_date DATE,
				status_id INTEGER,
				FOREIGN KEY (reader_id) REFERENCES reader (reader_id),
				FOREIGN KEY (librarian_id) REFERENCES librarian (librarian_id),
				FOREIGN KEY (status_id) REFERENCES status (status_id)
		)
	`);

	// Таблица выдач книг
	db.run(`
		CREATE TABLE IF NOT EXISTS borrowing (
				borrowing_id INTEGER PRIMARY KEY,
				reader_id INTEGER,
				book_id INTEGER,
				card_id INTEGER,
				librarian_id INTEGER,
				borrow_date DATE,
				return_date DATE,
				FOREIGN KEY (reader_id) REFERENCES reader (reader_id),
				FOREIGN KEY (book_id) REFERENCES book (book_id),
				FOREIGN KEY (card_id) REFERENCES card (card_id),
				FOREIGN KEY (librarian_id) REFERENCES librarian (librarian_id)
		)
	`);

	// Таблица возвратов книг
	db.run(`
		CREATE TABLE IF NOT EXISTS return (
				return_id INTEGER PRIMARY KEY,
				borrowing_id INTEGER,
				librarian_id INTEGER,
				return_date DATE,
				status_id INTEGER,
				FOREIGN KEY (borrowing_id) REFERENCES borrowing (borrowing_id),
				FOREIGN KEY (librarian_id) REFERENCES librarian (librarian_id),
				FOREIGN KEY (status_id) REFERENCES status (status_id)
		)
	`);

	// Таблица библиотекарей
	db.run(`
		CREATE TABLE IF NOT EXISTS librarian (
				librarian_id INTEGER PRIMARY KEY,
				user_id INTEGER,
				email TEXT,
				FOREIGN KEY (user_id) REFERENCES user (user_id)
		)
	`);

	// Таблица пользователей
	db.run(`
		CREATE TABLE IF NOT EXISTS user (
				user_id INTEGER PRIMARY KEY,
				username TEXT NOT NULL,
				first_name TEXT NOT NULL,
				last_name TEXT NOT NULL,
				patronymic_name TEXT,
				password TEXT NOT NULL,
				last_login DATE,
				roles TEXT
		)
	`);

	// Промежуточная таблица для связи М:М между author и book
	db.run(`
		CREATE TABLE IF NOT EXISTS book_author (
				book_id INTEGER,
				author_id INTEGER,
				PRIMARY KEY (book_id, author_id),
				FOREIGN KEY (book_id) REFERENCES book (book_id),
				FOREIGN KEY (author_id) REFERENCES author (author_id)
		)
	`);

});

module.exports = db;
