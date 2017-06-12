'use strict';

angular.module('articles').controller('ChangeHeaderImageController', ['$scope', '$timeout', '$stateParams', '$window', '$location', 'Authentication', 'FileUploader', 'Articles',
  function ($scope, $timeout, $stateParams, $window, $location, Authentication, FileUploader, Articles) {
    $scope.user = Authentication.user;
    $scope.article = Articles.get({
      articleId: $stateParams.articleId
    });

    $scope.init = function() {
      $scope.success = $scope.error = null;
      $scope.headerImage = $scope.article.headerMedia ? $scope.article.headerMedia.local_src : null;
    };

    // Create file uploader instance
    $scope.uploader = new FileUploader({
      url: '/api/articles/' + $stateParams.articleId + '/headerimage',
      alias: 'newHeaderImage'
    });

    // Set file uploader image filter
    $scope.uploader.filters.push({
      name: 'imageFilter',
      fn: function (item, options) {
        var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
        return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
      }
    });

    // Called after the user selected a new picture file
    $scope.uploader.onAfterAddingFile = function (fileItem) {
      if ($window.FileReader) {
        var fileReader = new FileReader();
        fileReader.readAsDataURL(fileItem._file);

        fileReader.onload = function (fileReaderEvent) {
          $timeout(function () {
            $scope.headerImage = fileReaderEvent.target.result;
          }, 0);
        };
      }
    };

    // Called after the article has been assigned a new header image
    $scope.uploader.onSuccessItem = function (fileItem, response, status, headers) {
      // Show success message
      $scope.success = true;

      console.log('response', response);

      // Populate user object
      $scope.user = Authentication.user = response.user;

      // Clear upload buttons
      $scope.cancelUpload();

      $location.path('articles/' + response._id);
    };

    // Called after the user has failed to upload a new picture
    $scope.uploader.onErrorItem = function (fileItem, response, status, headers) {
      // Clear upload buttons
      $scope.cancelUpload();

      console.log(fileItem, response, status, headers);

      // Show error message
      $scope.error = response.message;
    };

    // Change article header image
    $scope.uploadHeaderImage = function () {
      console.log($scope);

      // Clear messages
      $scope.success = $scope.error = null;

      // Start upload
      $scope.uploader.uploadAll();
    };

    // Cancel the upload process
    $scope.cancelUpload = function () {
      $scope.uploader.clearQueue();
      if ($scope.article.headerMedia) {
        if ($scope.article.headerMedia.url !== undefined) {
          $scope.article.headerMedia = $scope.article.headerMedia.url;
        } else {
          $scope.article.headerMedia = $scope.article.headerMedia.local_src;
        }
      }
    };
  }
]);
