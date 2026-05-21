const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;
const taskRouter = require('./routes/task.js');
const UserController = require('./controllers/userController');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const errorHandler = require('./middlewares/errorHandler');
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/tasks', taskRouter);

app.post('/login', UserController.login);
app.post('/register', UserController.register);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
