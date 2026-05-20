const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

router.get('/', taskController.findAll);
router.get('/:id', taskController.findById);
router.post('/', taskController.create);
router.put('/:id', taskController.update);
router.delete('/:id', taskController.delete);

// router-level error handler (pass-through to global middleware)
const errorHandler = require('../middlewares/errorHandler');
router.use(errorHandler);

module.exports = router;
