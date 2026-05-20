const express = require('express');
const app = express();
const port = 3000;
const taskRouter = require('./routes/task');
const UserController = require('./controllers/userController');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/tasks', taskRouter);

app.post('/login', UserController.login);
app.post('/register', UserController.register);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});