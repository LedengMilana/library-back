const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const { secret } = require("./config");
const db = require("./db");

const generateAccessToken = (id, roles) => {
	const payload = {
			id,
			roles
	};
	return jwt.sign(payload, secret, { expiresIn: "24h" });
};

class authController {
	async registration(req, res) {
			try {
					const errors = validationResult(req);
					console.log(errors.errors);
					
					
					if (!errors.isEmpty()) {
							return res.status(400).json({ message: "Ошибка при регистрации", errors });
					}
					const { surname, username, secondName, login, password } = req.body;
					
					db.get(`SELECT * FROM user WHERE username = ? OR first_name = ?`, [login, username], async (err, row) => {
							if (row) {
									return res.status(400).json({ message: "Пользователь с таким именем или почтой уже существует" });
							} else {
									const hashPassword = bcrypt.hashSync(password, 7);
									const date = new Date()
									// const roles = JSON.stringify(["ADMIN", "USER"])
									const roles = JSON.stringify(["USER"])
									db.run(`
											INSERT INTO user (username, first_name, last_name, patronymic_name, password, last_login, roles) 
											VALUES (?, ?, ?, ?, ?, ?, ?)
									`, [login, username, surname, secondName, hashPassword, date, roles], function(err) {
											if (err) {
													return res.status(400).json({ message: "Ошибка при регистрации" });
											}
											return res.json({ message: "Пользователь успешно зарегистрирован" });
									});
							}
					});
			} catch (e) {
					console.log(e);
					res.status(400).json({ message: "Registration error" });
			}
	}

	async login(req, res) {
			try {
					const { username, password } = req.body;

					db.get(`SELECT * FROM user WHERE username = ?`, [username], (err, user) => {
							if (!user) {
									return res.status(400).json({ message: "Неверный логин или пароль" });
							}
							const validPassword = bcrypt.compareSync(password, user.password);
							if (!validPassword) {
									return res.status(400).json({ message: "Неверный логин или пароль" });
							}
							
							const roles = JSON.parse(user.roles);
							const token = generateAccessToken(user.user_id, roles);
							return res.json({ token });
					});
			} catch (e) {
					console.log(e);
					res.status(400).json({ message: "Login error" });
			}
	}

	async getUsers(req, res) {
			try {
					db.all(`SELECT * FROM user`, [], (err, rows) => {
							if (err) {
									return res.status(400).json({ message: "Ошибка получения пользователей" });
							}
							res.json(rows);
					});
			} catch (e) {
					console.log(e);
					res.status(400).json({ message: "Ошибка" });
			}
	}


	async getUserInfo(req, res) {
    try {
        const userId = req.user.id;

        db.get(`SELECT first_name, last_name, patronymic_name FROM user WHERE user_id = ?`, [userId], (err, row) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Ошибка получения данных пользователя' });
            }
            if (!row) {
                return res.status(404).json({ message: 'Пользователь не найден' });
            }
            res.json(row);
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
	}

	async setAdmin(req, res) {
			try {
					const { id } = req.params;
					db.get(`SELECT * FROM user WHERE user_id = ?`, [id], (err, user) => {
							if (!user) {
									return res.status(404).json({ message: "Пользователь не найден" });
							}
							let roles = JSON.parse(user.roles);
							if (!roles.includes("ADMIN")) {
									roles.push("ADMIN");
							}
							roles = JSON.stringify(roles);
							db.run(`UPDATE user SET roles = ? WHERE user_id = ?`, [roles, id], function (err) {
									if (err) {
											return res.status(400).json({ message: "Ошибка при обновлении ролей" });
									}
									return res.json({ message: "Права администратора успешно добавлены" });
							});
					});
			} catch (e) {
					console.log(e);
					res.status(400).json({ message: "Ошибка сервера" });
			}
	}

	async removeAdmin(req, res) {
			try {
					const { id } = req.params;
					db.get(`SELECT * FROM user WHERE user_id = ?`, [id], (err, user) => {
							if (!user) {
									return res.status(404).json({ message: "Пользователь не найден" });
							}
							let roles = JSON.parse(user.roles);
							roles = roles.filter(r => r !== "ADMIN");
							roles = JSON.stringify(roles);
							db.run(`UPDATE user SET roles = ? WHERE user_id = ?`, [roles, id], function (err) {
									if (err) {
											return res.status(400).json({ message: "Ошибка при обновлении ролей" });
									}
									return res.json({ message: "Права администратора успешно удалены" });
							});
					});
			} catch (e) {
					console.log(e);
					res.status(400).json({ message: "Ошибка сервера" });
			}
	}

	async deleteUser(req, res) {
			try {
					const { id } = req.params;
					db.run(`DELETE FROM user WHERE user_id = ?`, [id], function (err) {
							if (err) {
									return res.status(400).json({ message: "Ошибка при удалении пользователя" });
							}
							return res.json({ message: "Пользователь успешно удален" });
					});
			} catch (e) {
					console.log(e);
					res.status(400).json({ message: "Ошибка сервера" });
			}
	}

}

module.exports = new authController();
