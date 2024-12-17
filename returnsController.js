const db = require('./db');

class ReturnController {
    async createReturn(req, res) {
        try {
            const { borrowing_id, actual_return_date } = req.body;

            if (!borrowing_id || !actual_return_date) {
                return res.status(400).json({ message: "Необходимы borrowing_id и actual_return_date" });
            }

            db.get(`SELECT return_date as due_date FROM borrowing WHERE borrowing_id = ?`, [borrowing_id], (err, borrowing) => {
                if (err) {
                    return res.status(400).json({ message: "Ошибка при получении данных о выдаче" });
                }
                if (!borrowing) {
                    return res.status(404).json({ message: "Выдача не найдена" });
                }

                const due_date = borrowing.due_date;
                const due = new Date(due_date);
                const actual = new Date(actual_return_date);

                let status_id = 7;
                if (actual > due) {
                    status_id = 8;
                }

                db.run(`
                    INSERT INTO return (borrowing_id, librarian_id, return_date, status_id)
                    VALUES (?, NULL, ?, ?)
                `, [borrowing_id, actual_return_date, status_id], function(err2) {
                    if (err2) {
                        return res.status(400).json({ message: "Ошибка при подтверждении возврата" });
                    }
                    db.get(`SELECT book_id FROM borrowing WHERE borrowing_id = ?`, [borrowing_id], (err3, borrowingData) => {
											if (err3) {
													return res.status(400).json({ message: "Ошибка при получении book_id для обновления статуса книги" });
											}
	
											if (!borrowingData) {
													return res.status(404).json({ message: "Данные о выдаче для обновления статуса книги не найдены" });
											}
	
											db.run(`
													UPDATE book
													SET status_id = 1
													WHERE book_id = ?
											`, [borrowingData.book_id], function(err4) {
													if (err4) {
															return res.status(400).json({ message: "Ошибка при обновлении статуса книги" });
													}
													return res.json({ message: "Возврат успешно зарегистрирован" });
											});
									});
                });
            });
        } catch (e) {
            console.log(e);
            return res.status(500).json({ message: "Ошибка сервера" });
        }
    }

		async getReturnedBooksByCard(req, res) {
			try {
					const { card_id } = req.params;
					const query = `
							SELECT re.return_id,
										 bo.title AS book_title,
										 re.return_date,
										 s.status_name,
										 b.borrow_date,
										 b.return_date AS due_date
							FROM return re
							LEFT JOIN borrowing b ON re.borrowing_id = b.borrowing_id
							LEFT JOIN book bo ON b.book_id = bo.book_id
							LEFT JOIN status s ON re.status_id = s.status_id
							WHERE b.card_id = ?
					`;
	
					db.all(query, [card_id], (err, rows) => {
							if (err) {
									return res.status(400).json({ message: "Ошибка при получении возвращенных книг" });
							}
							return res.json(rows);
					});
			} catch(e) {
					console.log(e);
					return res.status(500).json({ message: "Ошибка сервера" });
			}
	}
	
}

module.exports = new ReturnController();
