const { Task, Sequelize } = require('../models');

const { Op } = Sequelize;

class TasksController {
  static async get(req, res, next) {
    try {
      const search = (req.query.search || req.query.q || '').trim();
      const sortBy = (req.query.sortBy || req.query.sort || '').toLowerCase();

      const where = { UserId: req.user.id };

      if (search) {
        where[Op.or] = [
          { task: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
        ];
      }

      let order;
      // Always sort incomplete tasks first (completed=false) then completed tasks
      // followed by the requested secondary sort (due or priority).
      if (sortBy === 'due' || sortBy === 'duedate') {
        order = [
          ['completed', 'ASC'],
          ['due', 'ASC'],
          ['priority', 'ASC'],
        ];
      } else {
        order = [
          ['completed', 'ASC'],
          ['priority', 'ASC'],
          ['due', 'ASC'],
        ];
      }

      const tasks = await Task.findAll({ where, order });
      res.status(200).json(tasks);
    } catch (error) {
      next(error);
    }
  }
  static async getById(req, res, next) {
    try {
      const task = await Task.findByPk(req.params.id);
      if (!task) {
        const err = new Error('Task not found');
        err.name = 'NotFoundError';
        return next(err);
      }
      res.status(200).json(task);
    } catch (error) {
      next(error);
    }
  }
  static async create(req, res, next) {
    try {
      const body = req.body;
      if (!body.task) {
        const err = new Error('Task name is required');
        err.name = 'ValidationError';
        return next(err);
      }
      if (!body.due) {
        const err = new Error('Due date is required');
        err.name = 'ValidationError';
        return next(err);
      }
      if (!body.priority) {
        const err = new Error('Priority is required');
        err.name = 'ValidationError';
        return next(err);
      }
      if (!body.description) {
        const err = new Error('Description is required');
        err.name = 'ValidationError';
        return next(err);
      }
      const task = await Task.create({
        task: body.task,
        description: body.description,
        due: body.due,
        priority: body.priority,
        UserId: req.user.id,
        completed: false,
      });
      res.status(201).json(task);
    } catch (error) {
      next(error);
    }
  }
  static async update(req, res, next) {
    try {
      const task = await Task.findByPk(req.params.id);
      if (!task) {
        const err = new Error('Task not found');
        err.name = 'NotFoundError';
        return next(err);
      }
      const body = req.body;
      await task.update({
        task: body.task || task.task,
        description: body.description || task.description,
        due: body.due || task.due,
        priority: body.priority || task.priority,
      });
      res.status(200).json(task);
    } catch (error) {
      next(error);
    }
  }
  static async delete(req, res, next) {
    try {
      const task = await Task.findByPk(req.params.id);
      if (!task) {
        const err = new Error('Task not found');
        err.name = 'NotFoundError';
        return next(err);
      }
      await task.destroy();
      res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
  static async markDone(req, res, next) {
    try {
      const task = await Task.findByPk(req.params.id);
      if (!task) {
        const err = new Error('Task not found');
        err.name = 'NotFoundError';
        return next(err);
      }
      await task.update({ completed: true });
      res.status(200).json(task);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = TasksController;
