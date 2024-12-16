const knex = require("./connection.js");

async function getAllTasks() {
    return await knex('taskview');
}

async function getTasksByProjectId(project_id) {
    return await knex('taskview').where({project_id: project_id, is_deleted: false});
}

async function getTaskById(task_id) {
    const results =  await knex('taskview').where({id: task_id, is_deleted: false});
    return results[0];
}

async function createTask(name, description, duedate, status_id, project_id, assignedUsers) {
    
    await knex.transaction(async (trx) => {
        try {

                const insertedTasks = await trx('task').insert({name: name, description: description, duedate: duedate, status_id: status_id, project_id: project_id}).returning('*');

          //Function to assignUsers in tasks
                const insertedUsers = AssignUsersToTask(trx, assignedUsers, insertedTask.id);

                const insertedTask = insertedTasks[0]

          //Function to Create Log
                LogActivityInDB('TASK CREATED', JSON.stringify(insertedTask, insertedUsers));

                return {taskDetails: insertedTask, assignedUsers: insertedUsers};

        } 
        catch (error) {
          trx.rollback();
          console.error('Transaction failed:', error);
          return {error: 'Unable to create task.'};
        }
      });      
}

async function updateTask(task_id, name, description, duedate, status_id, project_id, assignedUsers) {
    await knex.transaction(async (trx) => {
        try
        {
            const updatedTasks = await trx('task').where({id: task_id})
                                .update({name: name, description: description, duedate: duedate, status_id: status_id, project_id: project_id, updated_at: knex.fn.now(), updated_by: 1})
                                .returning('*');
            const updatedUsers = AssignUsersToTask(trx, assignedUsers, task_id, 'Update');

            const updatedTask = updatedTasks[0];

            LogActivityInDB('TASK UPDATED', JSON.stringify(updatedTask, updatedUsers));

            return {taskDetails: updatedTask, assignedUsers: updatedUsers};
        }
        catch (error) {
            trx.rollback();
            console.error('Transaction failed:', error);
            return {error: 'Unable to update task.'};
          }
    })
}

async function deleteTask(task_id) {
    await knex.transaction(async (trx) => {
        try 
        {
            const deletedTasks = await trx('task').where({id: task_id}).update({is_deleted: true, updated_at: knex.fn.now()}).returning('*');

            const deletedUsers = await trx('user_task_assign').where({task_id: task_id}).update({is_deleted: true, updated_at: knex.fn.now()}).returning('*');

            const deletedTask = deletedTasks[0];

            LogActivityInDB('TASK DELETED', JSON.stringify(deletedTask, deletedUsers));

            return {taskDetails: deletedTask, assignedUsers: deletedUsers};
        }
        catch (error) {
            trx.rollback();
            console.error('Transaction failed:', error);
            return {error: 'Unable to delete task.'};
        }
    })
}


//Utility Functions

async function ValidateProjectUsers(user_ids, project_id) {
    const userAssignments = await knex('user_project_assign')
                                .whereIn({user_id: user_ids})
                                .andWhere({project_id: project_id});
    if(userAssignments.length !== user_ids.length) {
        return {error: 'Some users are not assigned to the project'};
    }
    return userAssignments;

}

async function AssignUsersToTask(trx, assignedUsers, task_id, assignmentType = 'Create') {
    if(assignmentType === 'Create') {
        const userAssingment = assignedUsers.map((user) => ({
            user_id: user.user_id,
            task_id: task_id,
            user_project_assign_id: user.id
        }));
    
        const insertedUsers = await trx('user_task_assign').insert(userAssingment).returning('*');
    
        return insertedUsers;
    }
    else {
         // Get existing assignments for the task
        const existingAssignments = await trx('user_task_assign')
            .where({ task_id: task_id })
            .select('user_id', 'is_deleted');
        
        const existingUserIds = existingAssignments.map((assignment) => assignment.user_id);
        const newUserIds = assignedUsers.map((user) => user.user_id);
        
        // 1. Set `is_deleted: false` for users in the list with `is_deleted: true`
        await trx('user_task_assign')
                .where({ task_id: task_id, is_deleted: true })
                .whereIn('user_id', newUserIds)
                .update({ is_deleted: false, updated_at: knex.fn.now() });

         // 2. Set `is_deleted: true` for users not in the list but with `is_deleted: false`
        await trx('user_task_assign')
                .where({ task_id: task_id, is_deleted: false })
                .whereNotIn('user_id', newUserIds)
                .update({ is_deleted: true, updated_at: knex.fn.now() });

         // 3. Insert new rows for users in the list but not in the table
        const newUsersToInsert = assignedUsers.filter((user) => !existingUserIds.includes(user.user_id));
        if (newUsersToInsert.length > 0) {
            const newAssignments = newUsersToInsert.map((user) => ({
                user_id: user.user_id,
                task_id: task_id,
                user_project_assign_id: user.id,
                updated_at: knex.fn.now()
            }));
            await trx('user_task_assign').insert(newAssignments);
        }
        const updatedUsers = assignedUsers.map((user) => ({
            user_id: user.user_id,
            task_id: task_id,
            user_project_assign_id: user.id
        }));
        return updatedUsers;
    }
}

async function LogActivityInDB(trx, activity_type, activity_description) {
    return await trx('activitylog').insert({activitytype: activity_type, description: activity_description});
}

module.exports = {
    getAllTasks,
    getTasksByProjectId,
    getTaskById,
    ValidateProjectUsers,
    createTask,
    updateTask,
    deleteTask
};