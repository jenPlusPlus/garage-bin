
exports.up = (knex, Promise) =>
  Promise.all([
    knex.schema.createTable('garage_items', (table) => {
      table.increments('id').primary();
      table.string('name');
      table.string('reason');
      table.string('cleanliness');
      table.timestamps(true, true);
    }),
  ])
    .catch(error => console.log(`Error migrating: ${error}`));

exports.down = (knex, Promise) =>
  Promise.all([
    knex.schema.dropTable('garage_items'),
  ]);
