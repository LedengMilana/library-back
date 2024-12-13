const Router = require('express')
const router = new Router()
const controller = require('./authController')
const {check} = require("express-validator")
const authMiddleware = require("./middleware/authMiddleware")
const roleMiddleware = require("./middleware/roleMiddleware")

router.post('/registration', [
	check("surname", "Поле фамилия не может быть пустым").notEmpty(),
	check("username", "Имя пользователя не может быть пустым").notEmpty(),
	check("secondName", "Поле отчество не может быть пустым").notEmpty(),
	check("login", "Логин не может быть пустым").notEmpty(),
	check("password", "Пароль должен быть больше 4 символов").isLength({min: 4})
], controller.registration)
router.post('/login', controller.login)
router.get('/users', roleMiddleware(["ADMIN"]), controller.getUsers)
router.get('/userinfo', authMiddleware, controller.getUserInfo);
router.post('/setAdmin/:id', roleMiddleware(["ADMIN"]), controller.setAdmin);
router.post('/removeAdmin/:id', roleMiddleware(["ADMIN"]), controller.removeAdmin);
router.delete('/deleteUser/:id', roleMiddleware(["ADMIN"]), controller.deleteUser);

module.exports = router