var request = require('supertest');
var should = require('should');

describe('/api/groups', function() {
  describe('POST /', function() {
    it('should create a new group with 201 Created', function(done) {
      request(app)
        .post('/api/groups/')
        .send(group1)
        .expect(201)
        .end(function(err, res) {
          res.body.name.should.eql(group1.name);
          res.body.id.should.be.a.Number;
          group1.id = res.body.id;
          done(err);
        });
    });

    it('should increment the id by +1', function(done) {
      request(app)
        .post('/api/groups/')
        .send(group2)
        .expect(201)
        .end(function(err, res) {
          res.body.name.should.eql(group2.name);
          res.body.id.should.be.a.Number;
          res.body.id.should.eql(group1.id+1);
          group2.id = group1.id+1;
          done(err);
        });
    });

  });

  describe('GET /', function() {
    it('should return all created groups', function(done) {
      request(app)
        .get('/api/groups')
        .expect(200)
        .end(function(err, res) {
          res.body.should.be.an.Array;
          // TODO: In order to test the individual sent
          // groups we have to connect to a test db
          done(err);
        });
    });
  });

  describe('GET /:id', function() {
    it('should return a created group', function(done) {
      request(app)
        .get('/api/groups/' + group1.id)
        .expect(200)
        .end(function(err, res) {
          res.body.name.should.eql(group1.name);
          res.body.id.should.eql(group1.id);
          done(err);
        });
    });

    it('should return a 404 if no event is found', function(done) {
      request(app)
        .get('/api/groups/' + group2.id+1)
        .expect(404)
        .end(function(err, res) {
          done(err);
        });
    });

  });

  describe('PUT /:id', function() {
    it('should update a groups value', function(done) {
      request(app)
        .put('/api/groups/' + group2.id)
        .send({ name: 'Die Kings mit dem Dings' })
        .expect(200)
        .end(function(err, res) {
          res.body.name.should.eql('Die Kings mit dem Dings');
          res.body.id.should.eql(group2.id);
          group2.name = 'Die Kings mit dem Dings';
          done(err);
        });
    });

    it('should return a 404 if no group is found', function(done) {
      request(app)
        .put('/api/groups/' + group2.id+1)
        .expect(404)
        .end(function(err, res) {
          done(err);
        });
    });
  });

  describe('POST /:id/groups', function() {
    it('should add an user to a group', function(done) {
      request(app)
        .post('/api/groups/' + group2.id + '/member')
        .send(user2)
        .expect(200)
        .end(function(err, res) {
          var members = res.body.members;
          members[members.length-1].id.should.eql(user2.id);
          done(err);
        });
    });

    it('should not add a nonexisting user to a group', function(done) {
      request(app)
        .post('/api/groups/' + group2.id + '/member')
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
        .get('/api/groups/' + group2.id + '/member')
        .expect(200)
        .end(function(err, res) {
          res.body.should.be.an.Array;
          res.body.should.have.length(1);
          done(err);
        });
    });
  });

  describe('DELETE /:id/member/:memberid', function() {
    it('should delete a member from a group', function(done) {
      request(app)
        .delete('/api/groups/' + group2.id + '/member/' + user2.id)
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
        .get('/api/groups/' + group2.id + '/member')
        .expect(404)
        .end(function(err, res) {
          done(err);
        });
    });
  });


});