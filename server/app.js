const express = require('express');
const app = express();
const port = 3000;
// const taskRouter = require('./routes/task');
const UserController = require('./controllers/userController');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const errorHandler = require('./middlewares/errorHandler');
// app.use('/tasks', taskRouter);
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/login', UserController.login);
app.post('/register', UserController.register);

// global error handler (catch all)
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
