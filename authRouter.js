const Router = require('express')
const router = new Router()
const controller = require('./authController')
const genreController = require('./genreController');
const statusController = require('./statusController');
const authorController = require('./authorController');
const bookController = require('./bookController');
const cardController = require('./cardController');
const borrowingController = require('./borrowingController');
const returnController = require('./returnsController');
const {check} = require("express-validator")
const authMiddleware = require("./middleware/authMiddleware")
const roleMiddleware = require("./middleware/roleMiddleware")
const readerController = require('./readerController');
const reportController = require('./reportController');

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

router.get('/genres', genreController.getGenres);
router.post('/genres', roleMiddleware(["ADMIN"]), genreController.createGenre);
router.put('/genres/:id', roleMiddleware(["ADMIN"]), genreController.updateGenre);
router.delete('/genres/:id', roleMiddleware(["ADMIN"]), genreController.deleteGenre);

router.get('/statuses', statusController.getStatuses);
router.post('/statuses', roleMiddleware(["ADMIN"]), statusController.createStatus);
router.put('/statuses/:id', roleMiddleware(["ADMIN"]), statusController.updateStatus);
router.delete('/statuses/:id', roleMiddleware(["ADMIN"]), statusController.deleteStatus);

router.get('/authors', authorController.getAuthors);
router.post('/authors', roleMiddleware(["ADMIN"]), authorController.createAuthor);
router.put('/authors/:id', roleMiddleware(["ADMIN"]), authorController.updateAuthor);
router.delete('/authors/:id', roleMiddleware(["ADMIN"]), authorController.deleteAuthor);

router.get('/books', bookController.getBooks);
router.post('/books', bookController.createBook);
router.put('/books/:id', bookController.updateBook);
router.delete('/books/:id', bookController.deleteBook);

router.get('/cards', cardController.getCards);
router.post('/cards', cardController.createCard);
router.put('/cards/:id', cardController.updateCardStatus);
router.delete('/cards/:id', cardController.deleteCard);
router.get('/cards/:id', cardController.getCardById);

router.put('/readers/:id', readerController.updateReader);

router.get('/borrowings/:card_id', borrowingController.getBorrowingsByCard);
router.post('/borrowings', borrowingController.createBorrowing);

router.post('/returns', returnController.createReturn);
router.get('/returned/:card_id', returnController.getReturnedBooksByCard);

router.get('/report/:card_id', reportController.generateReport);

module.exports = router