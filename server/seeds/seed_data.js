exports.seed = async function(knex) {
  // Clear all existing entries
  await knex('user_task_assign').del();
  await knex('task').del();
  await knex('status').del();
  await knex('user_project_assign').del();
  await knex('users').del();
  await knex('project').del();
  await knex('organization').del();

  // Insert into organization
  const [org1] = await knex('organization').insert({
    name: 'Tech Solutions',
    updated_by: 'seed',
  }).returning('id');
  const org1Id = org1.id || org1;

  const [org2] = await knex('organization').insert({
    name: 'Creative Innovations',
    updated_by: 'seed',
  }).returning('id');
  const org2Id = org2.id || org2;

  // Insert into project
  const [project1] = await knex('project').insert({
    name: 'Project Alpha',
    updated_by: 'seed',
  }).returning('id');
  const project1Id = project1.id || project1;

  const [project2] = await knex('project').insert({
    name: 'Project Beta',
    updated_by: 'seed',
  }).returning('id');
  const project2Id = project2.id || project2;

  // Insert into users
  const [user1] = await knex('users').insert({
    name: 'Alice',
    email: 'alice@example.com',
    password: 'hashedpassword1',
    updated_by: 'seed',
  }).returning('id');
  const user1Id = user1.id || user1;

  const [user2] = await knex('users').insert({
    name: 'Bob',
    email: 'bob@example.com',
    password: 'hashedpassword2',
    updated_by: 'seed',
  }).returning('id');
  const user2Id = user2.id || user2;

  const [user3] = await knex('users').insert({
    name: 'Charlie',
    email: 'charlie@example.com',
    password: 'hashedpassword3',
    updated_by: 'seed',
  }).returning('id');
  const user3Id = user3.id || user3;

  // Insert into user_project_assign
  const [upa1] = await knex('user_project_assign').insert({
    user_id: user1Id,
    project_id: project1Id,
    updated_by: 'seed',
  }).returning('id');
  const upa1Id = upa1.id || upa1;

  const [upa2] = await knex('user_project_assign').insert({
    user_id: user2Id,
    project_id: project2Id,
    updated_by: 'seed',
  }).returning('id');
  const upa2Id = upa2.id || upa2;

  // Insert into status
  const [status1] = await knex('status').insert({
    name: 'Pending',
    updated_by: 'seed',
  }).returning('id');
  const status1Id = status1.id || status1;

  const [status2] = await knex('status').insert({
    name: 'Completed',
    updated_by: 'seed',
  }).returning('id');
  const status2Id = status2.id || status2;

  // Insert into task
  const [task1] = await knex('task').insert({
    name: 'Task 1',
    description: 'First Task Description',
    duedate: new Date(),
    status_id: status1Id,
    project_id: project1Id,
    iscompleted: false,
    updated_by: 'seed',
  }).returning('id');
  const task1Id = task1.id || task1;

  const [task2] = await knex('task').insert({
    name: 'Task 2',
    description: 'Second Task Description',
    duedate: new Date(),
    status_id: status2Id,
    project_id: project2Id,
    iscompleted: true,
    updated_by: 'seed',
  }).returning('id');
  const task2Id = task2.id || task2;

  // Insert into user_task_assign
  await knex('user_task_assign').insert({
    user_id: user1Id,
    task_id: task1Id,
    user_project_assign_id: upa1Id,
    updated_by: 'seed',
  });

  await knex('user_task_assign').insert({
    user_id: user2Id,
    task_id: task2Id,
    user_project_assign_id: upa2Id,
    updated_by: 'seed',
  });

  await knex('user_task_assign').insert({
    user_id: user3Id,
    task_id: task1Id,
    user_project_assign_id: upa1Id,
    updated_by: 'seed',
  });
};
