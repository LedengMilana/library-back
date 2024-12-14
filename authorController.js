const db = require('./db');

class AuthorController {
    async createAuthor(req, res) {
        try {
            const { first_name, last_name, patronymic_name } = req.body;

            if (!first_name || !first_name.trim()) {
                return res.status(400).json({ message: "Поле 'Имя' не может быть пустым" });
            }
            if (!last_name || !last_name.trim()) {
                return res.status(400).json({ message: "Поле 'Фамилия' не может быть пустым" });
            }

            db.run(`
                INSERT INTO author (first_name, last_name, patronymic_name) VALUES (?, ?, ?)
            `, [first_name.trim(), last_name.trim(), patronymic_name?.trim() || null], function(err) {
                if (err) {
                    return res.status(400).json({ message: "Ошибка при добавлении автора" });
                }
                return res.json({ message: "Автор успешно добавлен" });
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Ошибка сервера" });
        }
    }

    async getAuthors(req, res) {
        try {
            db.all(`SELECT * FROM author`, [], (err, rows) => {
                if (err) {
                    return res.status(400).json({ message: "Ошибка получения авторов" });
                }
                return res.json(rows);
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Ошибка сервера" });
        }
    }

    async updateAuthor(req, res) {
        try {
            const { id } = req.params;
            const { first_name, last_name, patronymic_name } = req.body;

            if (!first_name || !first_name.trim()) {
                return res.status(400).json({ message: "Поле 'Имя' не может быть пустым" });
            }
            if (!last_name || !last_name.trim()) {
                return res.status(400).json({ message: "Поле 'Фамилия' не может быть пустым" });
            }

            db.run(`
                UPDATE author SET first_name = ?, last_name = ?, patronymic_name = ? WHERE author_id = ?
            `, [first_name.trim(), last_name.trim(), patronymic_name?.trim() || null, id], function(err) {
                if (err) {
                    return res.status(400).json({ message: "Ошибка при обновлении автора" });
                }
                if (this.changes === 0) {
                    return res.status(404).json({ message: "Автор не найден" });
                }
                return res.json({ message: "Автор успешно обновлен" });
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Ошибка сервера" });
        }
    }

    async deleteAuthor(req, res) {
        try {
            const { id } = req.params;
            db.run(`DELETE FROM author WHERE author_id = ?`, [id], function(err) {
                if (err) {
                    return res.status(400).json({ message: "Ошибка при удалении автора" });
                }
                if (this.changes === 0) {
                    return res.status(404).json({ message: "Автор не найден" });
                }
                return res.json({ message: "Автор успешно удален" });
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Ошибка сервера" });
        }
    }
}

module.exports = new AuthorController();
