const db = require('./db');

class ReportController {
    async generateReport(req, res) {
        try {
            const { card_id } = req.params;

            const cardInfo = await new Promise((resolve, reject) => {
                const query = `
                    SELECT c.card_id, c.issue_date,
                           r.reader_id, r.first_name, r.last_name, r.patronymic_name, r.phone_number, r.email, r.address
                    FROM card c
                    LEFT JOIN reader r ON c.reader_id = r.reader_id
                    WHERE c.card_id = ?
                `;
                db.get(query, [card_id], (err, row) => {
                    if (err) return reject(err);
                    if (!row) return reject(new Error("Билет не найден"));
                    resolve(row);
                });
            });

            const borrowings = await new Promise((resolve, reject) => {
                const query = `
                    SELECT b.borrowing_id, bo.title as book_title, b.card_id, 
                        r.last_name || ' ' || r.first_name || COALESCE(' '||r.patronymic_name, '') as reader_name,
                        b.borrow_date, b.return_date as due_date
                    FROM borrowing b
                    LEFT JOIN book bo ON b.book_id = bo.book_id
                    LEFT JOIN reader r ON b.reader_id = r.reader_id
                    LEFT JOIN return re ON b.borrowing_id = re.borrowing_id
                    WHERE b.card_id = ? AND re.return_id IS NULL
                `;
                db.all(query, [card_id], (err, rows) => {
                    if (err) return reject(err);
                    resolve(rows);
                });
            });

            const returnedBooks = await new Promise((resolve, reject) => {
                const query = `
                    SELECT re.return_id, bo.title AS book_title, re.return_date, s.status_name,
                           b.borrow_date, b.return_date AS due_date
                    FROM return re
                    LEFT JOIN borrowing b ON re.borrowing_id = b.borrowing_id
                    LEFT JOIN book bo ON b.book_id = bo.book_id
                    LEFT JOIN status s ON re.status_id = s.status_id
                    WHERE b.card_id = ?
                `;
                db.all(query, [card_id], (err, rows) => {
                    if (err) return reject(err);
                    resolve(rows);
                });
            });

            const rows = [];

            rows.push([`Номер билета:`, cardInfo.card_id]);
            rows.push([]);
            rows.push(['Фамилия','Имя','Отчество','Телефон','Адрес','Email']);
            rows.push([
                cardInfo.last_name,
                cardInfo.first_name,
                cardInfo.patronymic_name || '',
                cardInfo.phone_number || '',
                cardInfo.address || '',
                cardInfo.email || ''
            ]);

            rows.push([]);
            rows.push(['Список выданных книг']);
            rows.push(['Название книги','Номер чит. билета','ФИО читателя','Дата получения','Срок возврата']);
            if (borrowings.length === 0) {
                rows.push(['Нет выданных книг']);
            } else {
                borrowings.forEach(b => {
                    rows.push([b.book_title, b.card_id, b.reader_name, b.borrow_date, b.due_date]);
                });
            }

            rows.push([]);
            rows.push(['Список возвращённых книг']);
            rows.push(['Название книги','Дата получения','Срок возврата','Дата возврата','Статус возврата']);
            if (returnedBooks.length === 0) {
                rows.push(['Нет возвращённых книг']);
            } else {
                returnedBooks.forEach(rb => {
                    rows.push([rb.book_title, rb.borrow_date, rb.due_date, rb.return_date, rb.status_name]);
                });
            }

            const csvContent = rows.map(r => r.join(';')).join('\n');

            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
						res.setHeader('Content-Disposition', `attachment; filename="Otchet_bilet_${card_id}.csv"`);

						const BOM = '\ufeff';
						res.send(BOM + csvContent);


        } catch (error) {
            console.error(error);
            return res.status(400).json({ message: error.message || "Ошибка при формировании отчета" });
        }
    }
}

module.exports = new ReportController();
