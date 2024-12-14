const db = require('./db');

class GenreController {
    async createGenre(req, res) {
        try {
            const { genre_name } = req.body;
            if (!genre_name || !genre_name.trim()) {
                return res.status(400).json({ message: "Название жанра не может быть пустым" });
            }
            db.run(`INSERT INTO genre (genre_name) VALUES (?)`, [genre_name.trim()], function(err) {
                if (err) {
                    return res.status(400).json({ message: "Ошибка при добавлении жанра" });
                }
                return res.json({ message: "Жанр успешно добавлен" });
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Ошибка сервера" });
        }
    }

    async getGenres(req, res) {
        try {
            db.all(`SELECT * FROM genre`, [], (err, rows) => {
                if (err) {
                    return res.status(400).json({ message: "Ошибка получения жанров" });
                }
                return res.json(rows);
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Ошибка сервера" });
        }
    }

    async updateGenre(req, res) {
        try {
            const { id } = req.params;
            const { genre_name } = req.body;
            if (!genre_name || !genre_name.trim()) {
                return res.status(400).json({ message: "Название жанра не может быть пустым" });
            }
            db.run(`UPDATE genre SET genre_name = ? WHERE genre_id = ?`, [genre_name.trim(), id], function(err) {
                if (err) {
                    return res.status(400).json({ message: "Ошибка при обновлении жанра" });
                }
                if (this.changes === 0) {
                    return res.status(404).json({ message: "Жанр не найден" });
                }
                return res.json({ message: "Жанр успешно обновлен" });
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Ошибка сервера" });
        }
    }

    async deleteGenre(req, res) {
        try {
            const { id } = req.params;
            db.run(`DELETE FROM genre WHERE genre_id = ?`, [id], function(err) {
                if (err) {
                    return res.status(400).json({ message: "Ошибка при удалении жанра" });
                }
                if (this.changes === 0) {
                    return res.status(404).json({ message: "Жанр не найден" });
                }
                return res.json({ message: "Жанр успешно удален" });
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Ошибка сервера" });
        }
    }
}

module.exports = new GenreController();
