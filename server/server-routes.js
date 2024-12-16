const _ = require('lodash');
const todos = require('./database/todo-queries.js');
const taskService = require('./service/task-service.js');

function createToDo(req, data) {
  const protocol = req.protocol, 
    host = req.get('host'), 
    id = data.id;

  return {
    title: data.title,
    order: data.order,
    completed: data.completed || false,
    url: `${protocol}://${host}/${id}`
  };
}

async function getAllTodos(req, res) {
  const allEntries = await todos.all();
  return res.send(allEntries.map( _.curry(createToDo)(req) ));
}

async function getTodo(req, res) {
  const todo = await todos.get(req.params.id);
  return res.send(todo);
}

async function postTodo(req, res) {
  const created = await todos.create(req.body.title, req.body.order);
  return res.send(createToDo(req, created));
}

async function patchTodo(req, res) {
  const patched = await todos.update(req.params.id, req.body);
  return res.send(createToDo(req, patched));
}

async function deleteAllTodos(req, res) {
  const deletedEntries = await todos.clear();
  return res.send(deletedEntries.map( _.curry(createToDo)(req) ));
}

async function deleteTodo(req, res) {
  const deleted = await todos.delete(req.params.id);
  return res.send(createToDo(req, deleted));
}

async function getAllTasks(req, res) {
  const allTasks = await taskService.GetAllTasks()
  return res.send(allTasks);
}

async function getTasksByProjectId(req, res) {
  const tasks = await taskService.GetTasksByProjectId(req.params.id);
  return res.send(tasks);
}

async function getTaskById(req, res) {
  const task = await taskService.GetTasksById(req.params.id);
  return res.send(task);
}

async function postTask(req, res) {
  const created = await taskService.CreateTask(req.body);
  return res.send(created);
}

async function patchTask(req, res) {
  const updated = await taskService.UpdateTask(req.params.id, req.body);
  return res.send(updated);
}

async function deleteTask(req, res) {
  const deleted = await taskService.DeleteTask(req.params.id);
  return res.send(deleted);
}

function addErrorReporting(func, message) {
    return async function(req, res) {
        try {
            return await func(req, res);
        } catch(err) {
            console.log(`${message} caused by: ${err}`);

            // Not always 500, but for simplicity's sake.
            res.status(500).send(`Opps! ${message}.`);
        } 
    }
}

const toExport = {
    getAllTodos: { method: getAllTodos, errorMessage: "Could not fetch all todos" },
    getTodo: { method: getTodo, errorMessage: "Could not fetch todo" },
    postTodo: { method: postTodo, errorMessage: "Could not post todo" },
    patchTodo: { method: patchTodo, errorMessage: "Could not patch todo" },
    deleteAllTodos: { method: deleteAllTodos, errorMessage: "Could not delete all todos" },
    deleteTodo: { method: deleteTodo, errorMessage: "Could not delete todo" },
    getAllTasks: { method: getAllTasks, errorMessage: "Could not fetch all tasks" },
    getTasksByProjectId: { method: getTasksByProjectId, errorMessage: "Could not fetch tasks by project" },
    getTaskById: { method: getTaskById, errorMessage: "Could not get task by id" },
    postTask: { method: postTask, errorMessage: "Could not post task" },
    patchTask: { method: patchTask, errorMessage: "Could not patch task" },
    deleteTask: { method: deleteTask, errorMessage: "Could not delete task" }
}

for (let route in toExport) {
    toExport[route] = addErrorReporting(toExport[route].method, toExport[route].errorMessage);
}

module.exports = toExport;
