'use strict';

/**
 * Module dependencies.
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Articles Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([
    {
      roles: ['admin'],
      allows: [{
        resources: '/api/articles',
        permissions: '*'
      }, {
        resources: '/api/articles/authors',
        permissions: ['get']
      }, {
        resources: '/api/articles/authors/:author',
        permissions: ['get']
      }, {
        resources: '/api/articles/:articleId',
        permissions: '*'
      }, {
        resources: '/api/articles/:articleId/likes',
        permissions: ['post', 'delete']
      }, {
        resources: '/api/articles/:articleId/likes/:userId',
        permissions: ['get']
      }, {
        resources: '/api/articles/tags',
        permissions: ['get']
      }, {
        resources: '/api/articles/tags/:tag',
        permissions: ['get']
      }, {
        resources: '/api/articles/search/:searchText',
        permissions: ['get']
      }]
    }, {
      roles: ['user'],
      allows: [{
        resources: '/api/articles',
        permissions: ['get']
        //remove this in production, user should only have "create" access on comments
      }, {
        resources: '/api/articles/authors',
        permissions: ['get']
      }, {
        resources: '/api/articles/authors/:author',
        permissions: ['get']
      }, {
        resources: '/api/articles/tags',
        permissions: ['get']
      }, {
        resources: '/api/articles/tags/:tag',
        permissions: ['get']
      }, {
        resources: '/api/articles/search/:searchText',
        permissions: ['get']
      }, {
        resources: '/api/articles/:articleId',
        permissions: ['get', 'post']
      }, {
        resources: '/api/articles/:articleId/likes',
        permissions: ['post', 'delete']
      }, {
        resources: '/api/articles/:articleId/likes/:userId',
        permissions: ['get']
      }, {
        resources: '/api/articles/:articleId/:commentId',
        permissions: ['get', 'post', 'put', 'delete']
      }, {
        resources: '/api/articles/:articleId/:commentId/:replyId',
        permissions: ['get', 'post', 'put', 'delete']
      }]
    }, {
      roles: ['mentor'],
      allows: [{
        resources: '/api/articles',
        permissions: ['get', 'post']
      }, {
        resources: '/api/articles/authors',
        permissions: ['get']
      }, {
        resources: '/api/articles/authors/:author',
        permissions: ['get']
      }, {
        resources: '/api/articles/tags',
        permissions: ['get']
      }, {
        resources: '/api/articles/tags/:tag',
        permissions: ['get']
      }, {
        resources: '/api/articles/search/:searchText',
        permissions: ['get']
      }, {
        resources: '/api/articles/:articleId',
        permissions: ['get', 'post', 'put']
      }, {
        resources: '/api/articles/:articleId/likes',
        permissions: ['post', 'delete']
      }, {
        resources: '/api/articles/:articleId/likes/:userId',
        permissions: ['get']
      }, {
        resources: '/api/articles/:articleId/:commentId',
        permissions: ['get', 'post', 'put', 'delete']
      }, {
        resources: '/api/articles/:articleId/:commentId/:replyId',
        permissions: ['get', 'post', 'put', 'delete']
      }]
    }, {
      roles: ['guest'],
      allows: [{
        resources: '/api/articles',
        permissions: ['get']
      }, {
        resources: '/api/articles/authors',
        permissions: ['get']
      }, {
        resources: '/api/articles/authors/:author',
        permissions: ['get']
      }, {
        resources: '/api/articles/:articleId/likes/:userId',
        permissions: ['get']
      }, {
        resources: '/api/articles/tags',
        permissions: ['get']
      }, {
        resources: '/api/articles/tags/:tag',
        permissions: ['get']
      }, {
        resources: '/api/articles/search/:searchText',
        permissions: ['get']
      }, {
        resources: '/api/articles/:articleId',
        permissions: ['get']
      }, {
        resources: '/api/articles/:articleId/:commentId',
        permissions: ['get']
      }, {
        resources: '/api/articles/:articleId/:commentId/:replyId',
        permissions: ['get']
      }]
    }
  ]);
};

/**
 * Check If Articles Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  //extract 

  // If an article is being processed and the current user created it then allow any manipulation
  if (req.article && req.user && req.article.user.id === req.user.id) {
    return next();
  }
  //if the current user created the comment then allow any manipulations
  if (req.commentGo === true) {
    return next();
  }
  //if the current user created the reply then allow all manipulations
  if (req.replyGo === true) {
    return next();
  }
  // Check for user roles
  acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function (err, isAllowed) {
    if (err) {
      // An authorization error occurred.
      return res.status(500).send('Unexpected authorization error');
    } else {
      if (isAllowed) {
        // Access granted! Invoke next middleware
        return next();
      } else {
        return res.status(403).json({
          message: 'User is not authorized'
        });
      }
    }
  });
};
