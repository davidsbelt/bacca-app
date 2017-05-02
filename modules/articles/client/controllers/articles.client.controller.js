'use strict';

// Articles controller
angular.module('articles').controller('ArticlesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Articles',
  function ($scope, $stateParams, $location, Authentication, Articles) {
    $scope.authentication = Authentication;

    // Create new Article
    $scope.create = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'articleForm');

        return false;
      }

      /*var newTags = this.tags;
      // clean new tags up, have them separated by a comma
      newTags = newTags.trim().toString();
      newTags = newTags.replace(', ', ',').split(',');

      var tags = [];
      for (var tag in newTags) {
        console.log(tag);
        tags.push({
          text: newTags[tag]
        });
      }
      console.log(this);*/

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
      console.log(article);


      /*var newTags = this.tags;
      // clean new tags up, have them separated by a comma
      newTags = newTags.trim().toString();
      newTags = newTags.replace(', ', ',').split(',');

      var tags = [];
      for (var tag in newTags) {
        console.log(tag);
        tags.push({
          text: newTags[tag]
        });
      }
      console.log(newTags);


      article.$update(function () {
        $location.path('articles/' + article._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });*/
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

      console.log($scope.article);
    };
  }
]);
