'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  _ = require('lodash'),
  mongoose = require('mongoose'),
  Article = mongoose.model('Article'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create a article
 */
exports.create = function (req, res) {
  var article = new Article(req.body);
  article.user = req.user;
  
  article.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(article);
    }
  });
};

/**
 * Show the current article
 */
exports.read = function (req, res) {
  res.json(req.article);
};

/**
 * Update a article
 */
exports.update = function (req, res) {
  var article = req.article;

  article.title = req.body.title;
  article.content = req.body.content;

  article.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(article);
    }
  });
};

/**
 * Delete an article
 */
exports.delete = function (req, res) {
  var article = req.article;

  article.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(article);
    }
  });
};



/*
*Add a comment to a post
*/

exports.addComment = function(req, res){
  var article = req.article;
  article.comments.push(req.body);//should be replaced by req.body in prod and proper test
  _.last(article.comments).user = req.user;

  article.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(article);
    }
  });
};

/**
 * Delete a comment
 */
exports.deleteComment = function (req, res) {
  var article = req.article;
  for(var i in article.comments){
    if(article.comments[i]._id === req.params.commentId){
      _.pullAt(article.comments, i);
    }
  }
  

  article.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(article);
    }
  });
};

/**
 * update a comment
 */
exports.updateComment = function (req, res) {
  var article = req.article;
 
  for(var i in article.comments){
    var comment = article.comments[i]._id.toString();
    if ( comment === req.params.commentId ) {
      article.comments.splice(i, 1, req.body);
      article.comments[i].created = Date.now();
      break;

    }
  }
  article.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(article);//it could return only the comments
    }
  });
};

/**
 * Add comment reply
 */

exports.addCommentReply = function(req, res){
  var article = req.article;
  for(var i in article.comments){
    var comment = article.comments[i]._id.toString();
    if(comment === req.params.commentId){
      article.comments[i].reply.push(req.body);//should be replaced by req.body in production
      //add reply owner for referencing parent comment
      _.last(article.comments[i].reply).user = req.user;
      _.last(article.comments[i].reply).parent = req.params.commentId;
      break;
    }
  }
  console.log(article.comments);
  console.log(article.comments[0].reply);
  article.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(article);//it could return only the replies
     
    }
  });
};


/**
* Delete reply to comment
*/

exports.deleteCommentReply = function (req, res) {
  var article = req.article;
  for(var i in article.comments){
    if(article.comments[i]._id === req.params.commentId){
      for(var j in article.comments[i].reply){
        if(article.comments[i].reply[j]._id === req.params.replyId){
          _.pullAt(article.comments[i].reply, j);
        }
      }  
    }
  }

  article.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(article);
    }
  });
};


/**
 * update reply to a comment
 */
exports.updateCommentReply = function (req, res) {
  var article = req.article;
  for(var i in article.comments){
    if(article.comments[i]._id.toString() === req.params.commentId){
      for(var j in article.comments[i].reply){
        if(article.comments[i].reply[j]._id.toString() === req.params.replyId){
          article.comments[i].reply.splice(j, 1, req.body);
          //update creation time
          article.comments[i].reply[j].created = Date.now();
          break;
        }        
      }
      break;  
    }
  }

  article.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(article);
    }
  });
};


/**
 * Delete an article
 */



/**
 * List of Articles
 */
exports.list = function (req, res) {
  Article.find().sort('-created').populate('user', 'displayName').exec(function (err, articles) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(articles);
    }
  });
};

/**
 * Article middleware
 */
exports.articleByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Article is invalid'
    });
  }

  Article.findById(id).populate('user', 'displayName profileImageURL')
    //this works for only two level nesting
    .populate('comments.user', 'displayName profileImageURL')
    //for deeper nesting... this works
    .populate({path: 'comments.reply.user', model: 'User', select: 'displayName profileImageURL'})
    .exec(function (err, article) {
    if (err) {
      return next(err);
    } else if (!article) {
      return res.status(404).send({
        message: 'No article with that identifier has been found'
      });
    }
    req.article = article;
    next();
  });
};
