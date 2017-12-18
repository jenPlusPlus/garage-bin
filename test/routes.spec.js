/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
// /* eslint-disable arrow-body-style */

const chai = require('chai');

// eslint-disable-next-line no-unused-vars
const should = chai.should();
const chaiHttp = require('chai-http');
const server = require('../server');

const environment = process.env.NODE_ENV || 'test';
const configuration = require('../knexfile')[environment];
const database = require('knex')(configuration);


chai.use(chaiHttp);

describe('Client Routes', () => {
  it('should return the homepage', () =>
    chai.request(server)
      .get('/')
      .then((response) => {
        response.should.have.status(200);
        response.should.be.html;
      })
      .catch((err) => { throw err; }));

  it('should return a 404 for a route that does not exist', () =>
    chai.request(server)
      .get('/sad')
      .then((response) => {
        response.should.have.status(404);
      })
      .catch((err) => { throw err; }));
});

describe('API Routes', () => {
  before((done) => {
    database.migrate.latest()
      .then(() => done())
      .catch((error) => { throw error; });
  });

  beforeEach((done) => {
    database.seed.run()
      .then(() => done())
      .catch((error) => { throw error; });
  });

  describe('GET /api/v1/items', () => {
    it('should return all items from the garage_items table', () => {
      chai.request(server)
        .get('/api/v1/items')
        .then((response) => {
          response.should.have.status(200);
          response.should.be.json;
          response.body.should.be.an('object');
          response.body.garageItems.should.be.an('array');
          response.body.garageItems.length.should.equal(4);
          response.body.garageItems[0].should.have.property('id');
          response.body[0].id.should.equal(1);
          response.body.garageItems[0].should.have.property('name');
          response.body[0].name.should.equal('socks');
          response.body.garageItems[0].should.have.property('reason');
          response.body[0].name.should.equal('too many socks');
          response.body.garageItems[0].should.have.property('cleanliness');
          response.body[0].name.should.equal('Sparkling');
        })
        .catch((error) => { throw error; });
    });
  });

  describe('GET /api/v1/items/:id', () => {
    it('should return a single item from the garage_items table', () =>
      chai.request(server)
        .get('/api/v1/items/2')
        .then((response) => {
          response.should.have.status(200);
          response.should.be.json;
          response.body.should.be.an('object');
          response.body.garageItem.should.have.property('id');
          response.body.garageItem.id.should.equal(2);
          response.body.garageItem.should.have.property('name');
          response.body.garageItem.name.should.equal('tools');
          response.body.garageItem.should.have.property('reason');
          response.body.garageItem.reason.should.equal('belongs here');
          response.body.garageItem.should.have.property('cleanliness');
          response.body.garageItem.cleanliness.should.equal('Dusty');
        })
        .catch((error) => { throw error; }));


    it('should return 404 if no item found', () =>
      chai.request(server)
        .get('/api/v1/items/99999')
        .then((response) => {
          response.should.have.status(404);
          response.should.be.json;
          response.body.should.be.a('object');
          response.body.should.have.property('error');
          response.body.error.should.equal('Could not find any item associated with id 99999');
        })
        .catch((error) => { throw error; }));

    describe('POST /api/v1/items', () => {
      it('should add a new item to the database', () => {
        chai.request(server)
          .post('/api/v1/items')
          .send({
            name: 'new thing',
            reason: 'no space',
            cleanliness: 'Sparkling',
            id: 5,
          })
          .then((response) => {
            response.should.have.status(201);
            response.should.be.json;
            response.body.should.be.a('object');
            response.body.should.have.property('id');
            response.body.garageItem.id.should.equal(5);
          })
          .catch((error) => { throw error; });
      });

      it('should return a 422 error if a property is missing', () => {
        chai.request(server)
          .post('/api/v1/items')
          .send({
            name: 'new thing',
            reason: 'no space',
            id: 6,
          })
          .then((response) => {
            response.should.have.status(422);
            response.should.be.json;
            response.body.should.be.a('object');
            response.body.should.have.property('error');
            response.body.error.should.equal("You are missing the 'cleanliness' property");
          })
          .catch((error) => { throw error; });
      });
    });

    describe('PATCH /api/v1/items/:id', () => {
      it('should update an item in the database', () => {
        chai.request(server)
          .patch('/api/v1/items/3')
          .send({
            cleanliness: 'Sparkling',
          })
          .then((response) => {
            response.should.have.status(204);
            response.should.be.json;
            response.body.should.be.an('object');
            response.body.garageItem.should.have.property('id');
            response.body.garageItem.id.should.equal(3);
            response.body.garageItem.should.have.property('name');
            response.body.garageItem.name.should.equal('christmas decorations');
            response.body.garageItem.should.have.property('reason');
            response.body.garageItem.reason.should.equal('seasonal item');
            response.body.garageItem.should.have.property('cleanliness');
            response.body.garageItem.cleanliness.should.equal('Sparkling');
          })
          .catch((error) => { throw error; });
      });

      it('should return a 404 error if the item is not found', () => {
        chai.request(server)
          .patch('/api/v1/items/99999')
          .send({
            cleanliness: 'Sparkling',
          })
          .then((response) => {
            response.should.have.status(404);
            response.should.be.json;
            response.body.should.be.a('object');
            response.body.should.have.property('error');
            response.body.error.should.equal('Could not find any item associated with id 99999');
          })
          .catch((error) => { throw error; });
      });
    });
  });
});
