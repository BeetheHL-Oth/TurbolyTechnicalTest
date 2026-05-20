const bcrypt = require('../helpers/bcrypt');
const jwt = require('../helpers/jwt');
const { User } = require('../models');

class UserController {
  static async register(req, res, next) {
    try {
      const body = req.body;
      if (!body.username || !body.email || !body.password) {
        const err = new Error('Username, email, and password are required');
        err.name = 'ValidationError';
        err.status = 400;
        return next(err);
      }
      const passwordHash = await bcrypt.hashPassword(body.password);
      const user = await User.create({
        username: body.username,
        email: body.email,
        password: passwordHash,
      });
      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const body = req.body;
      const user = await User.findOne({ where: { email: body.email } });
      if (!user) {
        const err = new Error('Invalid email or password');
        err.name = 'AuthenticationError';
        err.status = 401;
        return next(err);
      }
      const isMatch = await bcrypt.comparePassword(
        body.password,
        user.password,
      );
      if (!isMatch) {
        const err = new Error('Invalid email or password');
        err.name = 'AuthenticationError';
        err.status = 401;
        return next(err);
      }
      const token = jwt.signToken({ id: user.id, email: user.email });
      res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
