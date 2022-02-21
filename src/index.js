const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const userAlreadyExists = users.find(user => user.username === username);
  if (!userAlreadyExists) {
    return response.status(404).json({ error: 'Username not found' });
  }
  request.user = userAlreadyExists;
  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some(user => user.username === username);
  if (userAlreadyExists) {
    return response.status(400).json({ error: 'Username already exists' });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todosOperation = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todosOperation);

  return response.status(201).json(todosOperation);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;
  const { title, deadline } = request.body;

  const todoExist = user.todos.find(todo => todo.id === id);
  if (!todoExist) {
    return response.status(404).json({ error: 'Todo not found' });
  }

  todoExist.title = title;
  todoExist.deadline = new Date(deadline);

  return response.status(200).json(todoExist);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todoExist = user.todos.find(todo => todo.id === id);
  if (!todoExist) {
    return response.status(404).json({ error: 'Todo not found!' });
  }

  todoExist.done = true;

  return response.status(200).json(todoExist);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todoExist = user.todos.findIndex(todo => todo.id === id);
  if (todoExist === -1) {
    return response.status(404).json({ error: 'Todo not found!' });
  }

  user.todos.splice(todoExist, 1);

  return response.status(204).json();
});

module.exports = app;