const db = require('./db');

class BookController {
    async getBooks(req, res) {
        try {
            const { title, author, genre } = req.query;

            let query = `
                SELECT b.book_id, b.title, b.publication_year, 
                       g.genre_name, 
                       s.status_name, 
                       a.first_name || ' ' || a.last_name || 
                       (CASE WHEN a.patronymic_name IS NOT NULL AND a.patronymic_name != '' THEN ' ' || a.patronymic_name ELSE '' END) AS author_full_name,
                       a.author_id,
                       g.genre_id,
                       s.status_id
                FROM book b
                LEFT JOIN author a ON b.author_id = a.author_id
                LEFT JOIN genre g ON b.genre_id = g.genre_id
                LEFT JOIN status s ON b.status_id = s.status_id
                WHERE 1=1
            `;

            const params = [];

            if (title && title.trim()) {
                query += ` AND b.title LIKE ?`;
                params.push(`%${title.trim()}%`);
            }

            if (author && author.trim()) {
                query += ` AND (a.first_name LIKE ? OR a.last_name LIKE ? OR a.patronymic_name LIKE ? )`;
                params.push(`%${author.trim()}%`, `%${author.trim()}%`, `%${author.trim()}%`);
            }

            if (genre && genre.trim()) {
                query += ` AND g.genre_name LIKE ?`;
                params.push(`%${genre.trim()}%`);
            }

            db.all(query, params, (err, rows) => {
                if (err) {
                    return res.status(400).json({ message: "Ошибка получения книг" });
                }
                res.json(rows);
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Ошибка сервера" });
        }
    }

    async createBook(req, res) {
        try {
            const { title, publication_year, author_id, genre_id, status_id } = req.body;
            if (!title || !title.trim()) {
                return res.status(400).json({ message: "Название книги не может быть пустым" });
            }

            db.run(`
                INSERT INTO book (title, publication_year, author_id, genre_id, status_id)
                VALUES (?, ?, ?, ?, ?)
            `, [title.trim(), publication_year || null, author_id || null, genre_id || null, status_id || null], function(err) {
                if (err) {
                    return res.status(400).json({ message: "Ошибка при добавлении книги" });
                }
                return res.json({ message: "Книга успешно добавлена" });
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Ошибка сервера" });
        }
    }

    async updateBook(req, res) {
        try {
            const { id } = req.params;
            const { title, publication_year, author_id, genre_id, status_id } = req.body;

            if (!title || !title.trim()) {
                return res.status(400).json({ message: "Название книги не может быть пустым" });
            }

            db.run(`
                UPDATE book SET title = ?, publication_year = ?, author_id = ?, genre_id = ?, status_id = ?
                WHERE book_id = ?
            `, [title.trim(), publication_year || null, author_id || null, genre_id || null, status_id || null, id], function(err) {
                if (err) {
                    return res.status(400).json({ message: "Ошибка при обновлении книги" });
                }
                if (this.changes === 0) {
                    return res.status(404).json({ message: "Книга не найдена" });
                }
                return res.json({ message: "Книга успешно обновлена" });
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Ошибка сервера" });
        }
    }

    async deleteBook(req, res) {
        try {
            const { id } = req.params;
            db.run(`DELETE FROM book WHERE book_id = ?`, [id], function(err) {
                if (err) {
                    return res.status(400).json({ message: "Ошибка при удалении книги" });
                }
                if (this.changes === 0) {
                    return res.status(404).json({ message: "Книга не найдена" });
                }
                return res.json({ message: "Книга успешно удалена" });
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Ошибка сервера" });
        }
    }
}

module.exports = new BookController();
