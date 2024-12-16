const app = require('./server-config.js');
const routes = require('./server-routes.js');
const http = require('http');
const ws = require('./websocket.js');

const port = process.env.PORT || 5000;

app.get('/todo', routes.getAllTodos);
app.get('/todo/:id', routes.getTodo);

app.post('/todo', routes.postTodo);
app.patch('/todo/:id', routes.patchTodo);

app.delete('/todo', routes.deleteAllTodos);
app.delete('/todo/:id', routes.deleteTodo);

app.get('/task', routes.getAllTasks);
app.get('/task/project/:id', routes.getTasksByProjectId);
app.get('/task/:id', routes.getTaskById);

app.post('/task', routes.postTask);
app.patch('/task/:id', routes.patchTask);

app.delete('/task/:id', routes.deleteTask);

const server = http.createServer(app);
ws.SetUpWebSocket(server);

if (process.env.NODE_ENV !== 'test') {
  server.listen(port, () => console.log(`Listening on port ${port}`));
}

module.exports = app;