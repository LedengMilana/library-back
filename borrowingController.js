const db = require('./db');

class BorrowingController {
    async getBorrowingsByCard(req, res) {
				try {
						const { card_id } = req.params;
						const query = `
								SELECT b.borrowing_id, bo.title AS book_title, b.card_id, 
											r.last_name || ' ' || r.first_name || COALESCE(' '||r.patronymic_name, '') as reader_name,
											b.borrow_date, b.return_date as due_date
								FROM borrowing b
								LEFT JOIN book bo ON b.book_id = bo.book_id
								LEFT JOIN reader r ON b.reader_id = r.reader_id
								LEFT JOIN return re ON b.borrowing_id = re.borrowing_id
								WHERE b.card_id = ? AND re.return_id IS NULL
						`;

						db.all(query, [card_id], (err, rows) => {
								if (err) {
										return res.status(400).json({ message: "Ошибка получения выданных книг" });
								}
								return res.json(rows);
						});
				} catch (e) {
						console.log(e);
						return res.status(500).json({ message: "Ошибка сервера" });
				}
		}

    async createBorrowing(req, res) {
        try {
            const { reader_id, book_id, card_id, borrow_date, due_date } = req.body;

            if (!reader_id || !book_id || !card_id || !borrow_date || !due_date) {
                return res.status(400).json({ message: "Необходимы reader_id, book_id, card_id, borrow_date, due_date" });
            }

            db.run(`
                INSERT INTO borrowing (reader_id, book_id, card_id, borrow_date, return_date)
                VALUES (?, ?, ?, ?, ?)
            `, [reader_id, book_id, card_id, borrow_date, due_date], function(err) {
                if (err) {
                    return res.status(400).json({ message: "Ошибка при регистрации выдачи книги" });
                }
                db.run(`
									UPDATE book
									SET status_id = 2
									WHERE book_id = ?
							`, [book_id], function(updateErr) {
									if (updateErr) {
											return res.status(400).json({ message: "Ошибка при обновлении статуса книги" });
									}
									return res.json({ message: "Выдача успешно зарегистрирована" });
							});
            });
        } catch (e) {
            console.log(e);
            return res.status(500).json({ message: "Ошибка сервера" });
        }
    }
}

module.exports = new BorrowingController();
