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
var app, agent, credentials1, credentials2, credentials3, user1, user2, user3, article, articleId, comment, comment2, commentUpdate, reply, reply2, replyUpdate, commentId1, replyId1, commentId2, replyId2;

/**
 * Article routes tests
 */

describe('Final Comments CRUD tests', function () {
  
  before(function (done) {
    // Get application
    app = express.init(mongoose);
    agent = request.agent(app);

    credentials1 = {
      username: 'thementor',
      password: 'M3@n.jsI$Aw3$ei8'
    };

    credentials2 = {
      username: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    credentials3 = {
      username: 'thirduser',
      password: 'M3@n.jsI$Aw78844'
    };

    comment = {
      content : 'this is a comment'
    };

    comment2 = {
      content : 'this is a second comment'
    };

    commentUpdate = {
      content: 'this is a comment update'
    };

    reply = {
      content: 'this is a reply'
    };

    reply2 = {
      content: 'this is a second reply'
    };

    replyUpdate = {
      content: 'this is a reply update'
    };
    user1 = new User({
      firstName: 'mentor',
      lastName: 'user',
      displayName: 'mentor user',
      email: 'mentor@test.com',
      roles: ['mentor'],
      username: credentials1.username,
      password: credentials1.password,
      provider: 'local'
    });

    user1.save(function () {
      article = {
        title: 'Article Title',
        content: 'Article Content',
        tags: [{ text: 'church-politics' }]
      };
    });
    user2 = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: credentials2.username,
      password: credentials2.password,
      provider: 'local'
    });

    user3 = new User({
      firstName: 'third',
      lastName: 'user',
      displayName: 'third user',
      email: 'tes3t@test.com',
      username: credentials3.username,
      password: credentials3.password,
      provider: 'local'
    });

    user2.save(function () {
      user3.save();      
    });

    agent.post('/api/auth/signin')
      .send(credentials1)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user1.id;

        // Save a new article
        agent.post('/api/articles')
          .send(article)
          .expect(200)
          .end(function (articleSaveErr, articleSaveRes) {
            // Handle article save error
            if (articleSaveErr) {
              return done(articleSaveErr);
            }
            
            articleId = articleSaveRes.body._id;
            // Set assertions
            (userId).should.equal(articleSaveRes.body.user._id);
            done();
          });
      });
  });


  it('should not be able save article if signed in as user', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials2)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Save a new article
        agent.post('/api/articles')
          .send(article)
          .expect(403)
          .end(function (articleSaveErr, articleSaveRes) {
            // Handle article save error
            if (articleSaveErr) {
              return done(articleSaveErr);
            }
            //set assertions
            (articleSaveRes.body.message).should.match('User is not authorized');
            done();
          });
      });
  });   

  it('should be able to save comment to article created by mentor', function (done){
    agent.post('/api/auth/signin')
      .send(credentials2)
      .expect(200)
      .end(function (signinErr, signinRes){
        if(signinErr){
          return done(signinErr);
        }
        //save a comment
        agent.post('/api/articles/' + articleId)
          .send(comment)
          .expect(200)
          .end(function (commentSaveErr, commentSaveRes){
            if (commentSaveErr){
              return done(commentSaveErr);
            }

            commentId1 = commentSaveRes.body.comments[0]._id;
            //set assertions
            (commentSaveRes.body.comments[0].content).should.match('this is a comment');
            done();
          });
      });
  });

  it('should be able to save update comment to article created by mentor', function (done){
    agent.post('/api/auth/signin')
      .send(credentials2)
      .expect(200)
      .end(function (signinErr, signinRes){
        if(signinErr){
          return done(signinErr);
        }
        //save a comment
        agent.put('/api/articles/' + articleId + '/' + commentId1)
          .send(commentUpdate)
          .expect(200)
          .end(function (commentUpdateErr, commentUpdateRes){
            if (commentUpdateErr){
              return done(commentUpdateErr);
            }
            //set assertions
            (commentUpdateRes.body.comments[0].content).should.match('this is a comment update');
            done();
          });
      });
  });  

  it('should be able to save reply to comment to article created by mentor', function (done){
    agent.post('/api/auth/signin')
      .send(credentials2)
      .expect(200)
      .end(function (signinErr, signinRes){
        if(signinErr){
          return done(signinErr);
        }
        //save a comment
        agent.post('/api/articles/' + articleId + '/' + commentId1)
          .send(reply)
          .expect(200)
          .end(function (commentReplyErr, commentReplyRes){
            if(commentReplyErr){
              return done(commentReplyErr);
            }

            replyId1 = commentReplyRes.body.comments[0].reply[0]._id;
            //set assertions
            (commentReplyRes.body.comments[0].reply[0].content).should.match('this is a reply');
            done();
          });
      });
  });

  it('should be able to update reply to comment to article created by mentor', function (done){
    agent.post('/api/auth/signin')
      .send(credentials2)
      .expect(200)
      .end(function (signinErr, signinRes){
        if(signinErr){
          return done(signinErr);
        }
        //save a comment
        agent.put('/api/articles/' + articleId + '/' + commentId1 + '/' + replyId1)
          .send(replyUpdate)
          .expect(200)
          .end(function (commentReplyUpdateErr, commentReplyUpdateRes){
            if(commentReplyUpdateErr){
              return done(commentReplyUpdateErr);
            }
            //set assertions
            (commentReplyUpdateRes.body.comments[0].reply[0].content).should.match('this is a reply update');
            done();
          });
      });
  });

  it('should be able to save a second comment to article created by mentor', function (done){
    agent.post('/api/auth/signin')
      .send(credentials3)
      .expect(200)
      .end(function (signinErr, signinRes){
        if(signinErr){
          return done(signinErr);
        }
        //save a comment
        agent.post('/api/articles/' + articleId)
          .send(comment2)
          .expect(200)
          .end(function (commentSaveErr, commentSaveRes){
            if(commentSaveErr){
              return done(commentSaveErr);
            }
            commentId2 = commentSaveRes.body.comments[1]._id;
            //set assertions
            (commentSaveRes.body.comments[1].content).should.match('this is a second comment');
            done();
          });
      });
  });

  it('should be able to save reply to comment (created by another user) to article created by mentor', function (done){
    agent.post('/api/auth/signin')
      .send(credentials3)
      .expect(200)
      .end(function (signinErr, signinRes){
        if(signinErr){
          return done(signinErr);
        }
        //save a comment
        agent.post('/api/articles/' + articleId + '/' + commentId1)
          .send(reply2)
          .expect(200)
          .end(function (commentReplyErr, commentReplyRes){
            if(commentReplyErr){
              return done(commentReplyErr);
            }

            replyId2 = commentReplyRes.body.comments[0].reply[1]._id;
            //set assertions
            (commentReplyRes.body.comments[0].reply[1].content).should.match('this is a second reply');
            done();
          });
      });
  });

  it('should not be able to delete reply to comment not created by same user', function (done){
    agent.post('/api/auth/signin')
      .send(credentials3)
      .expect(200)
      .end(function (signinErr, signinRes){
        if(signinErr){
          return done(signinErr);
        }

        //save a comment
        agent.delete('/api/articles/' + articleId + '/' + commentId1 + '/' + replyId1)
          .expect(403)
          .end(function (commentReplyUpdateErr, commentReplyUpdateRes){
            if(commentReplyUpdateErr){
              return done(commentReplyUpdateErr);
            }

            //set assertions
            (commentReplyUpdateRes.body.message).should.match('User is not authorized');
            done();
          });
      });
  });


  it('should not be able to delete comment not created by same user', function (done){
    agent.post('/api/auth/signin')
      .send(credentials3)
      .expect(200)
      .end(function (signinErr, signinRes){
        if(signinErr){
          return done(signinErr);
        }

        //save a comment
        agent.delete('/api/articles/' + articleId + '/' + commentId1)
          .expect(403)
          .end(function (commentReplyUpdateErr, commentReplyUpdateRes){
            if (commentReplyUpdateErr){
              return done(commentReplyUpdateErr);
            }

            //set assertions
            (commentReplyUpdateRes.body.message).should.match('User is not authorized');
            done();
          });
      });
  });

  it('should be able to delete reply to comment created by same user', function (done){
    agent.post('/api/auth/signin')
      .send(credentials2)
      .expect(200)
      .end(function (signinErr, signinRes){
        if(signinErr){
          return done(signinErr);
        }

        //save a comment
        agent.delete('/api/articles/' + articleId + '/' + commentId1 + '/' + replyId1)
          .expect(200)
          .end(function (commentReplyUpdateErr, commentReplyUpdateRes){
            if(commentReplyUpdateErr){
              return done(commentReplyUpdateErr);
            }

            //set assertions
            (commentReplyUpdateRes.body.comments[0].reply.length).should.equal(1);
            done();
          });
      });
  });

  it('should be able to delete comment created by same user', function (done){
    agent.post('/api/auth/signin')
      .send(credentials2)
      .expect(200)
      .end(function (signinErr, signinRes){
        if(signinErr){
          return done(signinErr);
        }

        //save a comment
        agent.delete('/api/articles/' + articleId + '/' + commentId1)
          .expect(200)
          .end(function (commentReplyUpdateErr, commentReplyUpdateRes){
            if(commentReplyUpdateErr){
              return done(commentReplyUpdateErr);
            }

            //set assertions
            (commentReplyUpdateRes.body.comments.length).should.equal(1);
            done();
          });
      });
  });


  after(function (done) {
    User.remove().exec(function () {
      Article.remove().exec(done);
    });
  }); 
});
