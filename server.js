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

// app.get('/api/v1/teams/:id', (request, response) => {
//   database('teams').where('id', request.params.id).select()
//     .then((team) => {
//       if (team.length) {
//         return response.status(200).json({ team: team[0] });
//       }
//       return response.status(404).json({ error: `Could not find any team associated with id ${request.params.id}` });
//     })
//     .catch(error => response.status(500).json({ error }));
// });

app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is running on ${app.get('port')}`);
});

module.exports = app;
