'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  _ = require('lodash'),
  mongoose = require('mongoose'),
  cloudinary = require('cloudinary'),
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
  article.intro = req.body.intro;
  article.content = req.body.content;
  article.tags = req.body.tags;

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

/**
 * Like a article
 */
exports.like = function (req, res) {
  var article = req.article;
  var liked = false;

  console.log(req.article);

  // to like an article, user must be included in the article's likes set
  // first find if user already likes article

  // but before that: does the article have any likes?
  if (article.likes.length > 0) {
    for (var i in article.likes) {
      if (article.likes[i].user.toString() !== undefined && article.likes[i].user.toString() === req.user._id.toString()) {
        liked = true;
        break;
      }
    }
  }

  if (liked === true) { // if user likes article
    res.json({ // send a message
      message: 'You already like this article.'
    });
  } else { // if user has not liked (or is not currently liking) article, then:
    article.likes.push({ // add user's _id to the likes set...
      user: req.body.user._id.toString()
    });

    article.save(function (err) { // ...and send the article
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.json(article);
      }
    });
  }
};

/**
 * Unlike a article
 */
exports.unlike = function (req, res) {
  var article = req.article;
  var unliked = true; // user currently not liking article
  var index = -1; // currently undefined index of user in the likes set

  // to unlike an article, user must be removed from article's likes set
  // first find if user already likes article
  for (var i in article.likes) {
    if (article.likes[i].user.toString() === req.user._id.toString()) {
      unliked = false; // user likes article => unlike can begin
      index = i;
      break;
    }
  }

  // at this point, user is still not liking article, so:
  if (unliked === true) { // given as above,
    res.json({ // send a message
      message: 'You have already unliked this article.'
    });
  } else { // ...otherwise, unlike the article...
    article.likes.splice(index); // ...by removing it from the likes set...
    article.save(function (err) { // ...and save the article.
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.json(article);
      }
    });
  }
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
  var comments = article.comments;

  for(var i in comments){
    var comment = comments[i];
    var commentIdString = comment._id !== undefined ? comment._id.toString() : null;
    if (commentIdString !== null) {
      console.log('comment exists!', commentIdString, req.params.commentId);
      if (commentIdString === req.params.commentId) {
        comments.splice(i);
        break;
      }
    }
  }

  article.comments = comments;

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

    /**
     * here's what ought to happen here:
     * if req.user is an admin, he can block, and unblock, comments.
     * any user can block, and unblock, a comment for themselves.
     * of course, the comment can be changed in content.
     */

    if (comment === req.params.commentId) {
      // update comment content
      if (req.body.content !== undefined) {
        article.comments[i].content = req.body.content;
      }
      // for admin: block the content
      if (req.user.roles.indexOf('admin') !== -1 && req.body.blocked !== undefined) {
        console.log('toggleBlock', req.body);
        article.comments[i].blocked = req.body.blocked;
      }
      // for all users: [un]block a comment
      if (req.body.userBlockMode !== undefined) { // ensure the block mode has been set
        if (req.body.userBlockMode === 'block') {
          article.comments[i].blockers.push(req.body.blocker);
        } else if (req.body.userBlockMode === 'unblock') {
          for(var j in article.comments[i].blockers) {
            if (article.comments[i].blockers[j]._id.toString() === req.body.blocker._id.toString()) {
              article.comments[i].blockers.splice(j);
            }
          }
        }
      }
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

    if(comment !== req.params.commentId.toString()) {
      continue;
    } else {
      //should be replaced by req.body in production
      article.comments[i].replies.push(req.body);

      //add reply owner for referencing parent comment
      _.last(article.comments[i].replies).user = req.user;
      _.last(article.comments[i].replies).parent = req.params.commentId;
    }
    break;
  }

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
    if(article.comments[i]._id.toString() === req.params.commentId){
      for(var j in article.comments[i].replies){
        if(article.comments[i].replies[j]._id.toString() === req.params.replyId){
          console.log('[i,j]:', i, j);
          article.comments[i].replies.splice(j);
          //_.pullAt(article.comments[i].replies, j);
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
 * update reply to a comment
 */
exports.updateCommentReply = function (req, res) {
  var article = req.article;
  for(var i in article.comments){
    if(article.comments[i]._id.toString() === req.params.commentId){
      for(var j in article.comments[i].replies){
        if(article.comments[i].replies[j]._id.toString() === req.params.replyId){
          article.comments[i].replies[j].content = req.body.content;
          //update creation time
          article.comments[i].replies[j].created = Date.now();
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
Text search article topics and content
*/

exports.textSearch = function(req, res){
  Article.find({ $text: { $search: req.params.searchText } }, { score: { $meta: 'textScore' } }).sort({ score: { $meta: 'textScore' } }).exec(function(err, article){
    if(err){
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json({
        articles: article
      });
    }
  });
};


/**
list of articles by tags
*/
exports.listArticlesByTags = function(req, res){
  Article.find({ 'tags.text': req.params.tag }).sort('-created').exec(function(err, articles){
    if(err){
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(articles);
    }
  });
};

/**
get all tags and counts of distinct tags
*/
exports.listTags = function (req, res){
  //responds with array of objects containing the tag and number of articles containing the tags
  Article.aggregate(
  [{ '$unwind': '$tags' }, { '$group': { '_id': '$tags.text', 'count': { $sum: 1 } } }]).exec(function(err, tags){
    if(err){
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json({
        tags: _.sortBy(tags, '_id')
      });
    }
  });
};

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
    .populate({ path: 'comments.replies.user', model: 'User', select: 'displayName profileImageURL' })
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

//compare user id to comments user id
exports.verifyComment = function(req, res, next){
  //console.log(req.article.comments);
  var commentId = req.params.commentId.toString();
  for(var i in req.article.comments){
    //console.log(i);
    //console.log('comment - ', commentId, req.article.comments[i]._id.toString());
    if (commentId === req.article.comments[i]._id) {
      if (req.user._id.toString() === req.article.comments[i].user._id.toString()){
        req.commentPosition = i;
        req.commentGo = true;
        req.comment = req.article.comments[i];
      }
    }
    break;
  }
  next();
};

exports.verifyReply = function(req, res, next){
  for(var i in req.article.comments){
    if(req.params.commentId.toString() === req.article.comments[i]._id.toString()){
      for(var j in req.article.comments[i].reply){
        var replyId = req.params.replyId;
        if (replyId === req.article.comments[i].reply[j]._id.toString()) {
          if (req.user.id === req.article.comments[i].reply[j].user._id.toString()){
            req.replyPosition = j;
            req.replyGo = true;
            req.reply = req.article.comments[i].reply[j];                       
          }
          break;
        }
      }
      break; 
    }
    
   
  }
  next();
};
