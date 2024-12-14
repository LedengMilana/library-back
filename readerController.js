const db = require('./db');

class ReaderController {
    async updateReader(req, res) {
        try {
            const { id } = req.params;
            const { first_name, last_name, patronymic_name, phone_number, address, email } = req.body;

            if (!first_name || !first_name.trim() || !last_name || !last_name.trim()) {
                return res.status(400).json({ message: "Имя и фамилия обязательны для заполнения" });
            }

            db.run(`
                UPDATE reader
                SET first_name = ?, last_name = ?, patronymic_name = ?, phone_number = ?, address = ?, email = ?
                WHERE reader_id = ?
            `, [
                first_name.trim(),
                last_name.trim(),
                patronymic_name?.trim() || null,
                phone_number?.trim() || null,
                address?.trim() || null,
                email?.trim() || null,
                id
            ], function(err) {
                if (err) {
                    return res.status(400).json({ message: "Ошибка при обновлении данных читателя" });
                }
                if (this.changes === 0) {
                    return res.status(404).json({ message: "Читатель не найден" });
                }
                return res.json({ message: "Данные читателя успешно обновлены" });
            });
        } catch (e) {
            console.log(e);
            return res.status(500).json({ message: "Ошибка сервера" });
        }
    }
}

module.exports = new ReaderController();
