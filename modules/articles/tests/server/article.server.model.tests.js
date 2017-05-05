'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Article = mongoose.model('Article');

/**
 * Globals
 */
var user, article;

/**
 * Unit tests
 */
describe('Article Model Unit Tests:', function () {

  beforeEach(function (done) {
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    });

    user.save(function () {
      article = new Article({
        title: 'Article Title',
        intro: 'Article Intro',
        content: 'Article Content',
        tags: [{ text: 'church' }],
        user: user
      });

      done();
    });
  });

  describe('Method Save', function () {
    it('should be able to save without problems', function (done) {
      this.timeout(10000);
      return article.save(function (err) {
        should.not.exist(err);
        done();
      });
    });

    it('should be able to show an error when trying to save without title', function (done) {
      article.title = '';

      return article.save(function (err) {
        should.exist(err);
        done();
      });
    });

    it('should be able to show an error when trying to save without intro', function (done) {
      article.intro = '';

      return article.save(function (err) {
        should.exist(err);
        done();
      });
    });

    //it('should be able to upload media to cloud service without problems', function(done){});

    it('should be able to show error when trying to save without content', function(done){
      article.content = '';

      return article.save(function(err){
        should.exist(err);
        done();
      });
    });
  });

  afterEach(function (done) {
    Article.remove().exec(function () {
      User.remove().exec(done);
    });
  });
});
