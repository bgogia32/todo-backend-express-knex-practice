const taskRepo = require('../database/task-queries.js');
const cacheClient = require('../redis.js');
const cache = cacheClient.cache;

const keyAllTasks = 'allTaskKey';

async function GetAllTasks() {
    const data = await cache.get(keyAllTasks);
    if(data) {
        console.log('Cache Hit: ', keyAllTasks);
        return data;
    }
    console.log('Cache Miss: ', keyAllTasks);
    const result = await taskRepo.getAllTasks();
    cache.set(keyAllTasks, result, 900);
    return result;
}

async function GetTasksByProjectId(project_id) {
    const projectKey = 'projectKey' + project_id;
    const data = await cache.get(projectKey);
    if(data) {
        console.log('Cache Hit: ', projectKey);
        return data;
    }
    console.log('Cache Miss: ', projectKey);
    const result = await taskRepo.getTasksByProjectId(project_id);
    cache.set(projectKey, result, 900);
    return result;
}

async function GetTasksById(task_id) {
    return await taskRepo.getTaskById(task_id);
}

async function CreateTask(taskDetails) {
    
    const assignedUsers = await taskRepo.ValidateProjectUsers(taskDetails.user_ids, taskDetails.project_id);
    if(assignedUsers.error) {
        return assignedUsers.error;
    }
    const result = await taskRepo.createTask(taskDetails.name, taskDetails.description, taskDetails.duedate, taskDetails.status_id, taskDetails.project_id, assignedUsers);
    DeleteCache(taskDetails.project_id);
    return result;
}

async function UpdateTask(task_id, taskDetails) {
    const assignedUsers = await taskRepo.ValidateProjectUsers(taskDetails.user_ids, taskDetails.project_id);
    if(assignedUsers.error) {
        return assignedUsers.error;
    }
    const result =  await taskRepo.updateTask(task_id, taskDetails.name, taskDetails.description, taskDetails.duedate, taskDetails.status_id, taskDetails.project_id, taskDetails.iscompleted, assignedUsers);
    DeleteCache(taskDetails.project_id);
    return result;
}

async function DeleteTask(task_id) {
    const result =  await taskRepo.deleteTask(task_id);
    DeleteCache(result.taskDetails.project_id);
    return result;
}

//Utility Function

async function DeleteCache(project_id) {
    const projectKey = 'projectKey' + project_id;
    await cache.deleteCahce(keyAllTasks);
    await cache.deleteCahce(projectKey);
}


module.exports = {
    GetAllTasks,
    GetTasksByProjectId,
    GetTasksById,
    CreateTask,
    UpdateTask,
    DeleteTask
}

