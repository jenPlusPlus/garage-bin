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

app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is running on ${app.get('port')}`);
});

module.exports = app;
