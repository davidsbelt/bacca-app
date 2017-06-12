'use strict';

/**
 * Module dependencies.
 */
var articlesPolicy = require('../policies/articles.server.policy'),
  articles = require('../controllers/articles.server.controller');

module.exports = function (app) {
  // Articles collection routes
  app.route('/api/articles').all(articlesPolicy.isAllowed)
    .get(articles.list)
    .post(articles.create);

  // Replies to comments on single article routes
  app.route('/api/articles/authors').all(articlesPolicy.isAllowed)
    .get(articles.authors);

  // Replies to comments on single article routes
  app.route('/api/articles/authors/:author').all(articlesPolicy.isAllowed)
   .get(articles.byAuthor);

  //get all available tags
  app.route('/api/articles/tags').all(articlesPolicy.isAllowed)
    .get(articles.listTags);

  //get articles based on tags
  app.route('/api/articles/tags/:tag').all(articlesPolicy.isAllowed)
    .get(articles.listArticlesByTags);

  //search database for articles containing text strings
  app.route('/api/articles/search/:searchText').all(articlesPolicy.isAllowed)
    .get(articles.textSearch);

  // Single article routes
  app.route('/api/articles/:articleId').all(articlesPolicy.isAllowed)
    .get(articles.read)
    .put(articles.update)
    .delete(articles.delete)
    .post(articles.addComment);
  //add comment here

  // Change article header image
  app.route('/api/articles/:articleId/headerimage').all(articlesPolicy.isAllowed)
    .get(articles.getHeaderImage)
    .post(articles.changeHeaderImage);
  //add comment here

  // likes/unlikes for single articles
  app.route('/api/articles/:articleId/likes').all(articlesPolicy.isAllowed)
    .post(articles.like)
    .delete(articles.unlike);

  // save media for single articles
  app.route('/api/articles/:articleId/media').all(articlesPolicy.isAllowed)
    // .get(articles.getMedia);
    .post(articles.saveMedia);
    // .delete(articles.deleteMedia);

  // comments on single article routes
  app.route('/api/articles/:articleId/:commentId').all(articlesPolicy.isAllowed)
    .post(articles.addCommentReply)
    .put(articles.updateComment)
    .delete(articles.deleteComment);
    //add replies here

  // Replies to comments on single article routes
  app.route('/api/articles/:articleId/:commentId/:replyId').all(articlesPolicy.isAllowed)
    .put(articles.updateCommentReply)
    .delete(articles.deleteCommentReply);

  // Finish by binding the article middleware
  app.param('articleId', articles.articleByID);
  app.param('commentId', articles.verifyComment);
  app.param('replyId', articles.verifyReply);
};
