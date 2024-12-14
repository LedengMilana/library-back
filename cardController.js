const db = require('./db');

class CardController {
    async getCards(req, res) {
        try {
            const query = `
                SELECT c.card_id, c.issue_date, s.status_name
                FROM card c
                LEFT JOIN status s ON c.status_id = s.status_id
            `;
            db.all(query, [], (err, rows) => {
                if (err) {
                    return res.status(400).json({ message: "Ошибка получения билетов" });
                }
                return res.json(rows);
            });
        } catch (e) {
            console.log(e);
            return res.status(500).json({ message: "Ошибка сервера" });
        }
    }

    async createCard(req, res) {
        try {
            const { first_name, last_name, patronymic_name, phone_number, address, email, status_id } = req.body;

            if (!first_name || !first_name.trim() || !last_name || !last_name.trim()) {
                return res.status(400).json({ message: "Имя и фамилия обязательны для заполнения" });
            }

            db.run(`
                INSERT INTO reader (first_name, last_name, patronymic_name, phone_number, email, address)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [
                first_name.trim(), 
                last_name.trim(), 
                patronymic_name?.trim() || null, 
                phone_number?.trim() || null, 
                email?.trim() || null, 
                address?.trim() || null
            ], function(err) {
                if (err) {
                    return res.status(400).json({ message: "Ошибка при создании читателя" });
                }

                const readerId = this.lastID;
                const cardStatusId = status_id || 5;
                const issueDate = new Date().toISOString().split('T')[0];

                db.run(`
                    INSERT INTO card (reader_id, librarian_id, issue_date, status_id)
                    VALUES (?, NULL, ?, ?)
                `, [readerId, issueDate, cardStatusId], function(err2) {
                    if (err2) {
                        return res.status(400).json({ message: "Ошибка при создании читательского билета" });
                    }
                    return res.json({ message: "Читательский билет успешно добавлен" });
                });
            });
        } catch (e) {
            console.log(e);
            return res.status(500).json({ message: "Ошибка сервера" });
        }
    }

    async updateCardStatus(req, res) {
        try {
            const { id } = req.params;
            const { status_id } = req.body;

            if (!status_id) {
                return res.status(400).json({ message: "status_id обязателен" });
            }

            db.run(`
                UPDATE card SET status_id = ? WHERE card_id = ?
            `, [status_id, id], function(err) {
                if (err) {
                    return res.status(400).json({ message: "Ошибка при обновлении статуса билета" });
                }
                if (this.changes === 0) {
                    return res.status(404).json({ message: "Билет не найден" });
                }
                return res.json({ message: "Статус читательского билета успешно обновлён" });
            });
        } catch (e) {
            console.log(e);
            return res.status(500).json({ message: "Ошибка сервера" });
        }
    }

    async deleteCard(req, res) {
        try {
            const { id } = req.params;
            db.run(`
                DELETE FROM card WHERE card_id = ?
            `, [id], function(err) {
                if (err) {
                    return res.status(400).json({ message: "Ошибка при удалении билета" });
                }
                if (this.changes === 0) {
                    return res.status(404).json({ message: "Билет не найден" });
                }
                return res.json({ message: "Читательский билет успешно удален" });
            });
        } catch (e) {
            console.log(e);
            return res.status(500).json({ message: "Ошибка сервера" });
        }
    }

		async getCardById(req, res) {
			try {
					const { id } = req.params;
					const query = `
							SELECT c.card_id, c.issue_date, c.reader_id, s.status_name,
										 r.first_name, r.last_name, r.patronymic_name, r.phone_number, r.address, r.email
							FROM card c
							LEFT JOIN status s ON c.status_id = s.status_id
							LEFT JOIN reader r ON c.reader_id = r.reader_id
							WHERE c.card_id = ?
					`;
					db.get(query, [id], (err, row) => {
							if (err) {
									return res.status(400).json({ message: "Ошибка при получении данных о билете" });
							}
							if (!row) {
									return res.status(404).json({ message: "Билет не найден" });
							}
							return res.json(row);
					});
			} catch (e) {
					console.log(e);
					return res.status(500).json({ message: "Ошибка сервера" });
			}
	}
	
}

module.exports = new CardController();
