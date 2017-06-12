'use strict';

//Articles service used for communicating with the articles REST endpoints
angular.module('articles').factory('Articles', ['$resource',
  function ($resource) {
    return $resource('api/articles/:articleId', {
      articleId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

angular.module('articles').factory('HeaderMedia', ['$resource',
  function ($resource) {
    return $resource('api/articles/:articleId/headermedia', {
      articleId: '@_id'
    }/*, {
      update: {
        method: 'PUT'
      }
    }*/);
  }
]);
