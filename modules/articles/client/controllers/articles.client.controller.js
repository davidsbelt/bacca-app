'use strict';

// Articles controller
angular.module('articles').controller('ArticlesController', ['$scope', '$http', '$stateParams', '$location', 'Authentication', 'Articles', 'Users',
  function ($scope, $http, $stateParams, $location, Authentication, Articles, Users) {
    $scope.authentication = Authentication;

    // Create new Article
    $scope.create = function (isValid) {
      console.log(Date.now());
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'articleForm');

        return false;
      }

      // Create new Article object
      var article = new Articles({
        title: this.title,
        intro: this.intro,
        content: this.content,
        tags: this.tags
      });

      // Redirect after save
      article.$save(function (response) {
        $location.path('articles/' + response._id);

        // Clear form fields
        $scope.title = '';
        $scope.intro = '';
        $scope.content = '';
        $scope.tags = '';
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Remove existing Article
    $scope.remove = function (article) {
      if (article) {
        article.$remove();

        for (var i in $scope.articles) {
          if ($scope.articles[i] === article) {
            $scope.articles.splice(i, 1);
          }
        }
      } else {
        $scope.article.$remove(function () {
          $location.path('articles');
        });
      }
    };

    // Update existing Article
    $scope.update = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'articleForm');

        return false;
      }

      var article = $scope.article;

      // Redirect after save
      article.$update(function (response) {
        $location.path('articles/' + response._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Find a list of Articles
    $scope.find = function () {
      $scope.articles = Articles.query();
    };

    // Find existing Article
    $scope.findOne = function () {
      $scope.article = Articles.get({
        articleId: $stateParams.articleId
      });
      var article = $scope.article;
      article.$promise.then(function (article) {
        article.liked = article.liked || false;
        $http.get('/api/articles/' + article._id + '/likes/' + $scope.authentication.user._id).success(function (response) {
          article.liked = response.status;
        });
      });
      $scope.article = article;
      $scope.activeComment = $scope.editableComment = $scope.editableCommentReply = null;
    };

    // List Articles by their tags
    $scope.findAuthors = function () {
      $scope.article = null;
      $scope.authors = null;
      $http.get('/api/articles/authors').success(function (response) {
        console.log(response);
        $scope.authors = response.authors;
      }).error(function (err) {
        console.log('error: ', err);
      });
    };

    $scope.findByAuthor = function () {
      $scope.author = null;
      $scope.article = null;
      $scope.articles = null;
      $http.get('/api/articles/authors/' + $stateParams.author).success(function (response) {
        console.log('success', response);
        $scope.author = response.author;
        $scope.articles = response.articles;
      }).error(function (err) {
        console.log('error: ', err);
      });
    };

    // List Articles by their tags
    $scope.findTags = function () {
      $scope.article = null;
      $http.get('/api/articles/tags').success(function (response) {
        $scope.tags = response.tags;
      }).error(function (err) {
        console.log(err);
      });
    };

    // List Articles with a specific tag
    $scope.findByTag = function () {
      var tag = $stateParams.tag;
      var realTag = '';

      $http.get('/api/articles/tags').success(function (response) {
        $scope.tags = response.tags;
        for (var i in $scope.tags) {
          var possibleTag = $scope.tags[i]._id.toString();
          console.log(i, $scope.tags[i]._id.toString());
          //console.log(i, realTag, possibleTag);
          if (possibleTag.toLowerCase() === tag.toLowerCase()) {
            realTag = $scope.tags[i]._id.toString();
            break;
          }
        }

        $http.get('/api/articles/tags/' + realTag).success(function (response) {
          console.log(response);
          $scope.articles = response;
          $scope.tag = realTag;
          console.log('tag: ', realTag);
        });
      });

    };

    // like an article
    $scope.like = function () {
      console.log('/api/articles/' + $stateParams.articleId + '/likes');
      $http.post('/api/articles/' + $stateParams.articleId + '/likes', {
        user: $scope.authentication.user
      }).success(function (response) {
        if (response._id !== undefined) {
          $scope.article = response;
          $scope.article.liked = true;
        } else {
          $scope.message = response.message;
        }
      });
    };

    // unlike an article
    $scope.unlike = function () {
      $http.delete('/api/articles/' + $stateParams.articleId + '/likes').success(function (response) {
        if (response._id !== undefined) {
          $scope.article = response;
          $scope.article.liked = false;
        } else {
          $scope.message = response.message;
        }
      });
    };

    // Find existing comment
    $scope.findComment = function () {
      Articles.get({
        articleId: $stateParams.articleId
      }).$promise.then(function (article) {
        $scope.article = article;

        for (var i in $scope.article.comments) {
          var comment = $scope.article.comments[i];
          if (comment._id === $stateParams.commentId) {
            $scope.comment = comment;
          }
        }
      });
    };

    // Find existing reply
    $scope.findReply = function () {
      Articles.get({
        articleId: $stateParams.articleId
      }).$promise.then(function (article) {
        $scope.article = article;
        console.log($scope.article);

        for (var i in $scope.article.comments) {
          var comment = $scope.article.comments[i];
          if (comment._id === $stateParams.commentId) {
            $scope.comment = comment;

            for (var j in $scope.comment.replies) {
              var reply = $scope.comment.replies[j];
              if (reply._id === $stateParams.replyId) {
                $scope.reply = reply;
              }
            }
          }
        }
      });
    };

    // Add a comment to a post
    $scope.addComment = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'articleForm');

        return false;
      }

      var content = this.content;
      var comment = {
        content: content
      };

      $http.post('/api/articles/' + $scope.article._id, comment).success(function (response) {
        $scope.article = response;
        $location.path('/articles/' + $scope.article._id);
        $scope.content = '';
      });
    };

    // Admin block a comment from a post
    $scope.adminBlockComment = function () {
      var comment = this.comment;
      console.log('preBlock', comment);
      comment.blocked = true;
      $http.put('/api/articles/' + $scope.article._id + '/' + comment._id, comment).success(function (response) {
        console.log(response);
        $scope.article = response;
        $location.path('/articles/' + $scope.article._id);
      });
    };

    // Admin unblock a comment from a post
    $scope.adminUnblockComment = function () {
      var comment = this.comment;
      console.log('postBlock', comment);
      comment.blocked = false;
      $http.put('/api/articles/' + $scope.article._id + '/' + comment._id, comment).success(function (response) {
        console.log(response);
        $scope.article = response;
        $location.path('/articles/' + $scope.article._id);
      });
    };

    // User block a comment from a post
    $scope.userBlockComment = function () {

      console.log(this);

      var comment = this.comment;
      var commentId = comment._id;

      var data = {
        userBlockMode: 'block',
        blocker: {
          user: $scope.authentication.user
        }
      };

      $http.put('/api/articles/' + $scope.article._id + '/' + comment._id, data).success(function (response) {
        $scope.article = response;
        $scope.editableComment = null;
        $location.path('/articles/' + $scope.article._id);
      });
    };

    // Remove a comment from a post
    $scope.userUnblockComment = function () {
    };

    // Remove a comment from a post
    $scope.editComment = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'articleForm');

        return false;
      }

      var comment = this.comment;
      var commentId = comment._id;

      $http.put('/api/articles/' + $scope.article._id + '/' + commentId, comment).success(function (response) {
        $scope.article = response;
        $scope.editableComment = null;
        $location.path('/articles/' + $scope.article._id);
      });
    };

    // Remove a comment from a post
    $scope.removeComment = function () {
      var commentId = this.comment._id;
      $http.delete('/api/articles/' + $scope.article._id + '/' + commentId).success(function (response) {
        console.log(response);
        $scope.article = response;
        $location.path('/articles/' + $scope.article._id);
      });
    };

    // Add a comment to a post
    $scope.addCommentReply = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'articleForm');

        return false;
      }

      var content = this.content;
      var commentId = this.comment._id;

      for (var i in $scope.article.comments) {
        var comment = $scope.article.comments[i];
        if (comment._id === commentId) {
          $scope.comment = comment;
        }
      }

      var reply = {
        content: content
      };

      $http.post('/api/articles/' + $scope.article._id + '/' + $scope.comment._id, reply).success(function (response) {
        $scope.article = response;
        $location.path('/articles/' + $scope.article._id);
        $scope.content = '';
      });
    };

    $scope.editCommentReply = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'articleForm');

        return false;
      }

      console.log(this);

      var replyId = this.reply._id;
      var commentId = this.$parent.comment._id;
      var articleId = this.$parent.$parent.article._id;

      var reply = {
        content: this.reply.content
      };

      $http.put('/api/articles/' + articleId + '/' + commentId + '/' + replyId, reply).success(function (response) {
        $scope.article = response;
        $location.path('/articles/' + $scope.article._id);
        $scope.content = '';
      });
    };

    $scope.removeCommentReply = function () {
      var replyId = this.reply._id;
      var commentId = this.$parent.comment._id;
      var articleId = this.$parent.$parent.article._id;

      console.log('check ids:> ', articleId, commentId, replyId);

      $http.delete('/api/articles/' + articleId + '/' + commentId + '/' + replyId).success(function (response) {
        $scope.article = response;
        $location.path('/articles/' + $scope.article._id);
        $scope.content = '';
      });
    };

    $scope.doCommentReply = function() {
      $scope.activeComment = this.comment._id;
      $scope.editableComment = null;
    };

    $scope.cancelCommentReply = function() {
      $scope.activeComment = null;
    };

    $scope.doCommentEdit = function() {
      $scope.activeComment = null;
      $scope.editableComment = this.comment._id;
    };

    $scope.cancelCommentEdit = function() {
      $scope.editableComment = null;
    };

    $scope.doCommentReplyEdit = function() {
      $scope.editableCommentReply = this.reply._id;
    };

    $scope.cancelCommentReplyEdit = function() {
      $scope.editableCommentReply = null;
    };
  }
]);
