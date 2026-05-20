const { Task } = require('../models');

async function taskAuth(req, res, next) {
  try {
    const id = req.params.id;
    const task = await Task.findByPk(id);
    if (!task) {
      const err = new Error('Task not found');
      err.name = 'NotFoundError';
      return next(err);
    }
    if (!req.user || task.UserId !== req.user.id) {
      const err = new Error('Forbidden');
      err.name = 'ForbiddenError';
      err.status = 403;
      return next(err);
    }
    req.task = task;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = taskAuth;
