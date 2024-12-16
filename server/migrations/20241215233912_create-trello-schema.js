exports.up = async function(knex) {
    await knex.schema.createTable('organization', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.string('name');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table.string('updated_by').defaultTo('1');
      table.boolean('is_deleted').defaultTo(false);
    });
  
    await knex.schema.createTable('project', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.string('name');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table.string('updated_by').defaultTo('1');
      table.boolean('is_deleted').defaultTo(false);
    });
  
    await knex.schema.createTable('users', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.string('name');
      table.string('email').unique();
      table.string('password');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table.string('updated_by').defaultTo('1');
      table.boolean('is_deleted').defaultTo(false);
    });
  
    await knex.schema.createTable('user_project_assign', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.uuid('project_id').references('id').inTable('project').onDelete('CASCADE');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table.string('updated_by').defaultTo('1');
      table.boolean('is_deleted').defaultTo(false);
      table.index(['project_id']);
    });
  
    await knex.schema.createTable('status', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.string('name');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table.string('updated_by').defaultTo('1');
      table.boolean('is_deleted').defaultTo(false);
    });
  
    await knex.schema.createTable('task', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.string('name');
      table.string('description');
      table.datetime('duedate');
      table.uuid('status_id').references('id').inTable('status').onDelete('CASCADE');
      table.uuid('project_id').references('id').inTable('project').onDelete('CASCADE');
      table.boolean('iscompleted').defaultTo(false);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table.string('updated_by').defaultTo('1');
      table.boolean('is_deleted').defaultTo(false);
      table.index(['project_id']);
    });
  
    await knex.schema.createTable('user_task_assign', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.uuid('task_id').references('id').inTable('task').onDelete('CASCADE');
      table.uuid('user_project_assign_id').references('id').inTable('user_project_assign').onDelete('CASCADE');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table.string('updated_by').defaultTo('1');
      table.boolean('is_deleted').defaultTo(false);
      table.index(['task_id']);
    });
  
    await knex.schema.createTable('comment', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.text('content');
      table.uuid('task_id').references('id').inTable('task').onDelete('CASCADE');
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table.string('updated_by').defaultTo('1');
      table.boolean('is_deleted').defaultTo(false);
    });
  
    await knex.schema.createTable('subtask', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.text('content');
      table.uuid('task_id').references('id').inTable('task').onDelete('CASCADE');
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.boolean('iscompleted').defaultTo(false);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table.string('updated_by').defaultTo('1');
      table.boolean('is_deleted').defaultTo(false);
    });
  
    await knex.schema.createTable('activitylog', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.string('activitytype');
      table.string('description');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table.string('updated_by').defaultTo('1');
      table.boolean('is_deleted').defaultTo(false);
    });

    await knex.schema.createTable('entity', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
        table.string('entity_value').notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
        table.integer('updated_by').defaultTo(1);
        table.boolean('is_deleted').defaultTo(false);
      });

    await knex.schema.createTable('task_entity', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
        table.uuid('task_id').references('id').inTable('task').onDelete('CASCADE');
        table.uuid('entity_id').references('id').inTable('entity').onDelete('CASCADE');
        table.string('entity_value').notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
        table.integer('updated_by').defaultTo(1);
        table.boolean('is_deleted').defaultTo(false);
      });
  
    await knex.raw(`
        CREATE OR REPLACE VIEW taskview AS
        SELECT 
          task.*, 
          project.name AS project_name, 
          users.name AS user_name,
          users.id AS user_id,
          status.name as status
        FROM task
        JOIN project ON task.project_id = project.id
        AND project.is_deleted = 'false'
        JOIN user_task_assign ON task.id = user_task_assign.task_id
        AND user_task_assign.is_deleted = 'false'
        JOIN users ON user_task_assign.user_id = users.id
        AND users.is_deleted = 'false'
        JOIN status ON status.id = task.status_id
        AND status.is_deleted = 'false';
      `);
  
    await knex.raw(`
        CREATE VIEW aggregateview AS
        SELECT
          (SELECT COUNT(*) FROM project WHERE is_deleted = false) AS total_projects,
          (SELECT COUNT(*) FROM task WHERE iscompleted = true AND is_deleted = false) AS completed_tasks,
          (SELECT COUNT(*) FROM task WHERE is_deleted = false) AS total_tasks,
          (SELECT COUNT(*) FROM users WHERE is_deleted = false) AS total_users
      `);
  };
  
  exports.down = async function(knex) {
    await knex.raw('DROP VIEW IF EXISTS taskview');
    await knex.raw('DROP VIEW IF EXISTS aggregateview');
    await knex.schema.dropTableIfExists('task_entity');
    await knex.schema.dropTableIfExists('activitylog');
    await knex.schema.dropTableIfExists('subtask');
    await knex.schema.dropTableIfExists('comment');
    await knex.schema.dropTableIfExists('user_task_assign');
    await knex.schema.dropTableIfExists('task');
    await knex.schema.dropTableIfExists('status');
    await knex.schema.dropTableIfExists('user_project_assign');
    await knex.schema.dropTableIfExists('users');
    await knex.schema.dropTableIfExists('project');
    await knex.schema.dropTableIfExists('organization');
    await knex.schema.dropTableIfExists('entity');
  };
  