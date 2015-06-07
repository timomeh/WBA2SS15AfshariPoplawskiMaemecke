var request = require('supertest');
var should = require('should');

describe('/api/events', function() {
  describe('POST /', function() {
    it('should create a new event with 201 Created', function(done) {
      request(app)
        .post('/api/events/')
        .send(event1)
        .expect(201)
        .end(function(err, res) {
          res.body.name.should.eql(event1.name);
          res.body.id.should.be.a.Number;
          event1.id = res.body.id;
          done(err);
        });
    });

    it('should increment the id by +1', function(done) {
      request(app)
        .post('/api/events/')
        .send(event2)
        .expect(201)
        .end(function(err, res) {
          res.body.name.should.eql(event2.name);
          res.body.id.should.be.a.Number;
          res.body.id.should.eql(event1.id+1);
          event2.id = event1.id+1;
          done(err);
        });
    });

  });

  describe('GET /:id', function() {
    it('should return a created event', function(done) {
      request(app)
        .get('/api/events/' + event1.id)
        .expect(200)
        .end(function(err, res) {
          res.body.name.should.eql(event1.name);
          res.body.id.should.eql(event1.id);
          done(err);
        });
    });

    it('should return a 404 if no event is found', function(done) {
      request(app)
        .get('/api/events/' + event2.id+1)
        .expect(404)
        .end(function(err, res) {
          done(err);
        });
    });

  });

  describe('PUT /:id', function() {
    it('should update an events value', function(done) {
      request(app)
        .put('/api/events/' + event2.id)
        .send({ name: 'Vielleicht tolle Sause' })
        .expect(200)
        .end(function(err, res) {
          res.body.name.should.eql('Vielleicht tolle Sause');
          res.body.id.should.eql(event2.id);
          event2.name = 'Vielleicht tolle Sause';
          done(err);
        });
    });

    it('should return a 404 if no event is found', function(done) {
      request(app)
        .put('/api/events/' + event2.id+1)
        .expect(404)
        .end(function(err, res) {
          done(err);
        });
    });
  });

  describe('DELETE /:id', function() {
    var tmpid = event1.id;
    it('should delete an event with 204 NO CONTENT', function(done) {
      request(app)
        .delete('/api/events/' + event1.id)
        .expect(204)
        .end(function(err, res) {
          res.body.should.be.empty;
          done(err);
        });
    });

    it('should return a 404 if no event is found', function(done) {
      request(app)
        .delete('/api/events/' + tmpid)
        .expect(404)
        .end(function(err, res) {
          done(err);
        });
    });
  });

  describe('POST /:id/member', function() {
    it('should add an user to an event', function(done) {
      request(app)
        .post('/api/events/' + event2.id + '/member')
        .send(user2)
        .expect(200)
        .end(function(err, res) {
          var members = res.body.members;
          members[members.length-1].id.should.eql(user2.id);
          done(err);
        });
    });

    it('should not add a nonexisting user to an event', function(done) {
      request(app)
        .post('/api/events/' + event2.id + '/member')
        .send(user1)
        .expect(404)
        .end(function(err, res) {
          done(err);
        });
    });
  });

  describe('GET /:id/member/', function() {
    it('should return all members', function(done) {
      request(app)
        .get('/api/events/' + event2.id + '/member')
        .expect(200)
        .end(function(err, res) {
          res.body.should.be.an.Array;
          res.body.should.have.length(1);
          done(err);
        });
    });
  });

  describe('DELETE /:id/member/:memberid', function() {
    it('should delete a member from an event', function(done) {
      request(app)
        .delete('/api/events/' + event2.id + '/member/' + user2.id)
        .expect(200)
        .end(function(err, res) {
          res.body.should.not.have.keys('member');
          done(err);
        });
    });
  });

  

  describe('GET /:id/member/', function() {

    it('should return a 404 if no members exist', function(done) {
      request(app)
        .get('/api/events/' + event2.id + '/member')
        .expect(404)
        .end(function(err, res) {
          done(err);
        });
    });
  });


});