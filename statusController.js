const db = require('./db');

class StatusController {
    async createStatus(req, res) {
        try {
            const { status_name } = req.body;
            if (!status_name || !status_name.trim()) {
                return res.status(400).json({ message: "Название статуса не может быть пустым" });
            }
            db.run(`INSERT INTO status (status_name) VALUES (?)`, [status_name.trim()], function(err) {
                if (err) {
                    return res.status(400).json({ message: "Ошибка при добавлении статуса" });
                }
                return res.json({ message: "Статус успешно добавлен" });
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Ошибка сервера" });
        }
    }

    async getStatuses(req, res) {
        try {
            db.all(`SELECT * FROM status`, [], (err, rows) => {
                if (err) {
                    return res.status(400).json({ message: "Ошибка получения статусов" });
                }
                return res.json(rows);
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Ошибка сервера" });
        }
    }

    async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status_name } = req.body;
            if (!status_name || !status_name.trim()) {
                return res.status(400).json({ message: "Название статуса не может быть пустым" });
            }
            db.run(`UPDATE status SET status_name = ? WHERE status_id = ?`, [status_name.trim(), id], function(err) {
                if (err) {
                    return res.status(400).json({ message: "Ошибка при обновлении статуса" });
                }
                if (this.changes === 0) {
                    return res.status(404).json({ message: "Статус не найден" });
                }
                return res.json({ message: "Статус успешно обновлен" });
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Ошибка сервера" });
        }
    }

    async deleteStatus(req, res) {
        try {
            const { id } = req.params;
            db.run(`DELETE FROM status WHERE status_id = ?`, [id], function(err) {
                if (err) {
                    return res.status(400).json({ message: "Ошибка при удалении статуса" });
                }
                if (this.changes === 0) {
                    return res.status(404).json({ message: "Статус не найден" });
                }
                return res.json({ message: "Статус успешно удален" });
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Ошибка сервера" });
        }
    }
}

module.exports = new StatusController();
