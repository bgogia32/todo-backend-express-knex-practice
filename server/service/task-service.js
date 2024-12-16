const taskRepo = require('../database/task-queries.js');

async function GetAllTasks() {
    return await taskRepo.getAllTasks();
}

async function GetTasksByProjectId(project_id) {
    return await taskRepo.getTasksByProjectId(project_id);
}

async function GetTasksById(task_id) {
    return await taskRepo.getTaskById(task_id);
}

async function CreateTask(taskDetails) {
    
    const assignedUsers = taskRepo.ValidateProjectUsers(taskDetails.user_ids, taskDetails.project_id);
    if(assignedUsers.error) {
        return assignedUsers.error;
    }
    return await taskRepo.createTask(taskDetails.name, taskDetails.description, taskDetails.duedate, taskDetails.status_id, taskDetails.project_id, assignedUsers);
}

async function UpdateTask(taskDetails) {
    const assignedUsers = taskRepo.ValidateProjectUsers(taskDetails.user_ids, taskDetails.project_id);
    if(assignedUsers.error) {
        return assignedUsers.error;
    }
    return await taskRepo.updateTask(taskDetails.task_id, taskDetails.name, taskDetails.description, taskDetails.duedate, taskDetails.status_id, taskDetails.project_id, assignedUsers);
}

async function DeleteTask(task_id) {
    return await taskRepo.deleteTask(task_id);
}

//Utility Function


module.exports = {
    GetAllTasks,
    GetTasksByProjectId,
    GetTasksById,
    CreateTask,
    UpdateTask,
    DeleteTask
}

