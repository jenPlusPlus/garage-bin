/* eslint no-restricted-syntax: 0 */

const express = require('express');
const path = require('path');

const app = express();
const bodyParser = require('body-parser');


app.set('port', process.env.PORT || 3000);

app.locals.title = 'Garage Bin';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

app.use(express.static(path.join(__dirname, '/public')));

app.get('/api/v1/items', (request, response) => {
  database('garage_items').select()
    .then(garageItems => response.status(200).json({ garageItems }))
    .catch(error => response.status(500).json({ error }));
});

app.get('/api/v1/items/:id', (request, response) => {
  database('garage_items').where('id', request.params.id).select()
    .then((garageItem) => {
      if (garageItem.length) {
        return response.status(200).json({ garageItem: garageItem[0] });
      }
      return response.status(404).json({ error: `Could not find any item associated with id ${request.params.id}` });
    })
    .catch(error => response.status(500).json({ error }));
});

app.post('/api/v1/items', (request, response) => {
  const { name, reason, cleanliness } = request.body;
  const garageItem = { name, reason, cleanliness };

  for (const requiredParameter of ['name', 'reason', 'cleanliness']) {
    if (!garageItem[requiredParameter]) {
      return response.status(422).json({ error: `You are missing the '${requiredParameter}' property` });
    }
  }

  database('garage_items').insert(garageItem, '*')
    .then(insertedGarageItem => response.status(201).json({ garageItem: insertedGarageItem[0] }))
    .catch(error => response.status(500).json({ error }));

  return null;
});

app.patch('/api/v1/items/:id', (request, response) => {
  const garageItemID = request.params.id;
  const { cleanliness } = request.body;

  database('garage_items').where('id', garageItemID).update({ cleanliness }, '*')
    .then((updatedGarageItem) => {
      if (!updatedGarageItem.length) {
        return response.status(404).json({ error: `Could not find any item associated with id ${request.params.id}` });
      }
      return response.status(201).json({ garageItem: updatedGarageItem[0] });
    })
    .catch(error => response.status(500).json({ error }));
});


app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is running on ${app.get('port')}`);
});

module.exports = app;
