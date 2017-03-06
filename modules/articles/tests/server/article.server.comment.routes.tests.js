'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Article = mongoose.model('Article'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, article, comment, commentUpdate, reply, replyUpdate;

/**
 * Article routes tests
 */
describe('Comments CRUD tests', function () {
  before(function (done) {
    // Get application
    app = express.init(mongoose);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      username: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    comment = {
    	content: 'this is a comment'
    };

    commentUpdate = {
    	content: 'this is a comment update'
    }; 

    reply = {
    	content: 'this is a reply'
    };  

    replyUpdate = {
    	content: 'this is a reply update'
    };         

    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: credentials.username,
      password: credentials.password,
      provider: 'local'
    });

    // Save a user to the test db and create new article
    user.save(function () {
      article = {
        title: 'Article Title',
        content: 'Article Content'
      };

      done();
    });
  });

  it('should be able save a comment if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new article
        agent.post('/api/articles')
          .send(article)
          .expect(200)
          .end(function (articleSaveErr, articleSaveRes) {
            // Handle article save error
            if (articleSaveErr) {
              return done(articleSaveErr);
            }

            

            // Update an existing article
            agent.post('/api/articles/' + articleSaveRes.body._id)
              .send(comment)
              .expect(200)
              .end(function (articleUpdateErr, articleUpdateRes) {
                // Handle article update error
                if (articleUpdateErr) {
                  return done(articleUpdateErr);
                }

                // Set assertions
                (articleUpdateRes.body._id).should.equal(articleSaveRes.body._id);
                (articleUpdateRes.body.comments[0]).should.match(comment);

                // Call the assertion callback
                done();
              });
          });
      });
  }); 

  it('should not be able save an empty comment if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new article
        agent.post('/api/articles')
          .send(article)
          .expect(200)
          .end(function (articleSaveErr, articleSaveRes) {
            // Handle article save error
            if (articleSaveErr) {
              return done(articleSaveErr);
            }

            

            // Update an existing article
            agent.post('/api/articles/' + articleSaveRes.body._id)
              .send('')
              .expect(400)
              .end(function (articleUpdateErr, articleUpdateRes) {
                // Handle article update error
                if (articleUpdateErr) {
                  return done(articleUpdateErr);
                }

                // Set assertions
                //(articleUpdateRes.body._id).should.equal(articleSaveRes.body._id);
                (articleUpdateRes.body.message).should.match('content cannot be blank');

                // Call the assertion callback
                done();
              });
          });
      });
  }); 

  it('should be able to update a comment if signed in and created by user', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new article
        agent.post('/api/articles')
          .send(article)
          .expect(200)
          .end(function (articleSaveErr, articleSaveRes) {
            // Handle article save error
            if (articleSaveErr) {
              return done(articleSaveErr);
            }

            

            // save a comment to an article
            agent.post('/api/articles/' + articleSaveRes.body._id)
              .send(comment)
              .expect(200)
              .end(function (articleUpdateErr, articleUpdateRes) {
                // Handle article update error
                if (articleUpdateErr) {
                  return done(articleUpdateErr);
                }

                // Set assertions
                (articleUpdateRes.body._id).should.equal(articleSaveRes.body._id);
                (articleUpdateRes.body.comments[0]).should.match(comment);

                // Call the assertion callback
                
                agent.put('/api/articles/' + articleSaveRes.body._id + '/' + articleUpdateRes.body.comments[0]._id)
                	.send(commentUpdate)
                	.expect(200)
                	.end(function (updateErr, updateRes) {
                		if (updateErr) {
                			return done(updateErr);
                		}
                		(updateRes.body.comments[0].content).should.match('this is a comment update');
                		done();
                	});
              });
          });
      });
  });
  it('should be able to save a reply to a comment if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new article
        agent.post('/api/articles')
          .send(article)
          .expect(200)
          .end(function (articleSaveErr, articleSaveRes) {
            // Handle article save error
            if (articleSaveErr) {
              return done(articleSaveErr);
            }

            

            // save a comment to an article
            agent.post('/api/articles/' + articleSaveRes.body._id)
              .send(comment)
              .expect(200)
              .end(function (articleUpdateErr, articleUpdateRes) {
                // Handle article update error
                if (articleUpdateErr) {
                  return done(articleUpdateErr);
                }

                // Set assertions
                (articleUpdateRes.body._id).should.equal(articleSaveRes.body._id);
                (articleUpdateRes.body.comments[0]).should.match(comment);

                // Call the assertion callback
                
                agent.post('/api/articles/' + articleSaveRes.body._id + '/' + articleUpdateRes.body.comments[0]._id)
                	.send(reply)
                	.expect(200)
                	.end(function (updateErr, updateRes) {
                		if (updateErr) {
                			return done(updateErr);
                		}
                		(updateRes.body.comments[0].reply[0].content).should.match('this is a reply');
                		done();
                	});
              });
          });
      });
  });
  /*
  it('should be able to update reply to a comment if signed in and created by user', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new article
        agent.post('/api/articles')
          .send(article)
          .expect(200)
          .end(function (articleSaveErr, articleSaveRes) {
            // Handle article save error
            if (articleSaveErr) {
              return done(articleSaveErr);
            }

            

            // save a comment to an article
            agent.post('/api/articles/' + articleSaveRes.body._id)
              .send(comment)
              .expect(200)
              .end(function (articleUpdateErr, articleUpdateRes) {
                // Handle article update error
                if (articleUpdateErr) {
                  return done(articleUpdateErr);
                }

                // Set assertions
                (articleUpdateRes.body._id).should.equal(articleSaveRes.body._id);
                (articleUpdateRes.body.comments[0]).should.match(comment);

                // Call the assertion callback
                
                agent.post('/api/articles/' + articleSaveRes.body._id + '/' + articleUpdateRes.body.comments[0]._id)
                	.send(reply)
                	.expect(200)
                	.end(function (updateErr, updateRes) {
                		if (updateErr) {
                			return done(updateErr);
                		}
                		(updateRes.body.comments[0].reply[0].content).should.match('this is a reply');
                		
                		agent.put('/api/articles/' + articleSaveRes.body._id + '/' + articleUpdateRes.body.comments[0]._id + '/' + updateRes.body.comments[0].reply[0]._id)
                			.send(replyUpdate)
                			.expect(200)
                			.end(function (err, res){
                				if (err){
                					return done(err);
                				}
                				(res.body.comments[0].reply[0].content).should.match('this is a reply update');
                				done();
                			});
                			
                	});
              });
          });
      });
  });
  */  
  afterEach(function (done) {
    User.remove().exec(function () {
      Article.remove().exec(done);
    });
  });  
});