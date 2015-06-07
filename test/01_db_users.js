var request = require('supertest');
var should = require('should');

describe('/api/users', function() {
  describe('POST /', function() {
    it('should create a new user with 201 Created', function(done) {
      request(app)
        .post('/api/users/')
        .send(user1)
        .expect(201)
        .end(function(err, res) {
          res.body.vorname.should.eql(user1.vorname);
          res.body.nachname.should.eql(user1.nachname);
          res.body.id.should.be.a.Number;
          user1.id = res.body.id;
          done(err);
        });
    });

    it('should increment the id by +1', function(done) {
      request(app)
        .post('/api/users/')
        .send(user2)
        .expect(201)
        .end(function(err, res) {
          res.body.vorname.should.eql(user2.vorname);
          res.body.nachname.should.eql(user2.nachname);
          res.body.id.should.eql(user1.id+1);
          user2.id = user1.id+1;
          done(err);
        });
    });

  });

  describe('GET /:id', function() {
    it('should return a created user', function(done) {
      request(app)
        .get('/api/users/' + user1.id)
        .expect(200)
        .end(function(err, res) {
          res.body.vorname.should.eql(user1.vorname);
          res.body.nachname.should.eql(user1.nachname);
          res.body.id.should.eql(user1.id);
          done(err);
        });
    });

    it('should return a 404 if no user is found', function(done) {
      request(app)
        .get('/api/users/' + user2.id+1)
        .expect(404)
        .end(function(err, res) {
          done(err);
        });
    });

  });

  describe('PUT /:id', function() {
    it('should update a users value', function(done) {
      request(app)
        .put('/api/users/' + user2.id)
        .send({ nachname: 'Longus' })
        .expect(200)
        .end(function(err, res) {
          res.body.vorname.should.eql(user2.vorname);
          res.body.nachname.should.eql('Longus');
          res.body.id.should.eql(user2.id);
          done(err);
        });
    });

    it('should return a 404 if no user is found', function(done) {
      request(app)
        .put('/api/users/' + user2.id+1)
        .expect(404)
        .end(function(err, res) {
          done(err);
        });
    });
  });

  describe('DELETE /:id', function() {
    var tmpid = user1.id;
    it('should delete a user with 204 NO CONTENT', function(done) {
      request(app)
        .delete('/api/users/' + user1.id)
        .expect(204)
        .end(function(err, res) {
          res.body.should.be.empty;
          done(err);
        });
    });

    it('should return a 404 if no user is found', function() {
      request(app)
        .delete('/api/users/' + tmpid)
        .expect(404)
        .end(function(err, res) {
          done(err);
        });
    });
  });
});