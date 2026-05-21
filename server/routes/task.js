const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const auth = require('../middlewares/auth');
const authZ = require('../middlewares/authZ');

router.use(auth);

router.get('/', taskController.get);
router.get('/:id', authZ, taskController.getById);
router.post('/', taskController.create);
router.put('/:id', authZ, taskController.update);
router.delete('/:id', authZ, taskController.delete);
router.patch('/:id', authZ, taskController.markDone);

const errorHandler = require('../middlewares/errorHandler');
router.use(errorHandler);

module.exports = router;
