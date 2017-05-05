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
    };

    // Find existing comment
    $scope.findComment = function () {
      Articles.get({
        articleId: $stateParams.articleId
      }).$promise.then(function (article) {
        $scope.article = article;
        console.log($scope.article);

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

    $scope.doReply = function() {
      $scope.activeComment = this.comment._id;
      $scope.editableComment = null;
    };

    $scope.cancelReply = function() {
      $scope.activeComment = null;
    };

    $scope.doEdit = function() {
      $scope.activeComment = null;
      $scope.editableComment = this.comment._id;
    };

    $scope.cancelEdit = function() {
      $scope.editableComment = null;
    };
  }
]);
