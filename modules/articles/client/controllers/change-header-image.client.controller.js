'use strict';

angular.module('articles').controller('ChangeHeaderImageController', ['$scope', '$timeout', '$stateParams', '$window', 'Authentication', 'FileUploader', 'Articles',
  function ($scope, $timeout, $stateParams, $window, Authentication, FileUploader, Articles) {
    $scope.user = Authentication.user;
    $scope.article =  Articles.get({
      articleId: $stateParams.articleId
    });
    $scope.imageURL = $scope.article.headerMedia || null;

    // Create file uploader instance
    $scope.uploader = new FileUploader({
      url: 'api/articles/' + $stateParams.articleId + '/headerimage',
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
            $scope.imageURL = fileReaderEvent.target.result;
          }, 0);
        };
      }
    };

    // Called after the article has been assigned a new header image
    $scope.uploader.onSuccessItem = function (fileItem, response, status, headers) {
      // Show success message
      $scope.success = true;

      // Populate user object
      $scope.user = Authentication.user = response;

      // Clear upload buttons
      $scope.cancelUpload();
    };

    // Called after the user has failed to upload a new picture
    $scope.uploader.onErrorItem = function (fileItem, response, status, headers) {
      // Clear upload buttons
      $scope.cancelUpload();

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
      //$scope.imageURL = $scope.article.profileImageURL;
    };
  }
]);
