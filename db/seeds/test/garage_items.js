
exports.seed = (knex, Promise) =>
  knex('garage_items').del()
    .then(() =>
      Promise.all([
        knex('garage_items').insert([
          {
            id: 1, name: 'socks', reason: 'too many socks', cleanliness: 'Sparkling',
          },
          {
            id: 2, name: 'tools', reason: 'belongs here', cleanliness: 'Dusty',
          },
          {
            id: 3, name: 'christmas decorations', reason: 'seasonal item', cleanliness: 'Rancid',
          },
          {
            id: 4, name: 'souvenirs', reason: 'storage', cleanliness: 'Sparkling',
          },
        ]),
      ]))
    .then(() => console.log('Seeding complete'))
    .catch(error => console.log(`Error seeding data: ${error}`));
