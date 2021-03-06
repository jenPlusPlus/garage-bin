
exports.seed = (knex, Promise) =>
  knex('garage_items').del()
    .then(() =>
      Promise.all([
        knex('garage_items').insert([
          { name: 'socks', reason: 'too many socks', cleanliness: 'Sparkling' },
          { name: 'tools', reason: 'belongs here', cleanliness: 'Dusty' },
          { name: 'christmas decorations', reason: 'seasonal item', cleanliness: 'Rancid' },
          { name: 'souvenirs', reason: 'storage', cleanliness: 'Sparkling' },
        ]),
      ]))
    .then(() => console.log('Seeding complete'))
    .catch(error => console.log(`Error seeding data: ${error}`));
