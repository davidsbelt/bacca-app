'use strict';

// Setting up route
angular.module('articles').config(['$stateProvider',
  function ($stateProvider) {
    // Articles state routing
    $stateProvider
      .state('articles', {
        abstract: true,
        url: '/articles',
        template: '<ui-view/>'
      })
      .state('articles.list', {
        url: '',
        templateUrl: 'modules/articles/client/views/list-articles.client.view.html'
      })
      .state('articles.create', {
        url: '/create',
        templateUrl: 'modules/articles/client/views/create-article.client.view.html',
        data: {
          roles: ['mentor', 'admin']
        }
      })
      .state('articles.authors', {
        url: '/authors',
        templateUrl: 'modules/articles/client/views/list-authors.client.view.html'
      })
      .state('articles.author', {
        url: '/authors/:author',
        templateUrl: 'modules/articles/client/views/articles-author.client.view.html'
      })
      .state('articles.search', {
        url: '/search/:searchText',
        templateUrl: 'modules/articles/client/views/search-articles.client.view.html'
      })
      .state('articles.tags', {
        url: '/tags',
        templateUrl: 'modules/articles/client/views/list-tags.client.view.html'
      })
      .state('articles.tag', {
        url: '/tags/:tag',
        templateUrl: 'modules/articles/client/views/articles-tag.client.view.html'
      })
      .state('articles.view', {
        url: '/:articleId',
        templateUrl: 'modules/articles/client/views/view-article.client.view.html'
      })
      .state('articles.edit', {
        url: '/:articleId/edit',
        templateUrl: 'modules/articles/client/views/edit-article.client.view.html',
        data: {
          roles: ['mentor', 'admin']
        }
      })
      .state('articles.header', {
        url: '/:articleId/header-image',
        templateUrl: 'modules/articles/client/views/change-article-header-image.client.view.html',
        data: {
          roles: ['mentor', 'admin']
        }
      })
      .state('articles.comment', {
        url: '/:articleId/:commentId',
        templateUrl: 'modules/articles/client/views/view-comment.client.view.html'
      })
      .state('articles.reply', {
        url: '/:articleId/:commentId/:replyId',
        templateUrl: 'modules/articles/client/views/view-reply.client.view.html'
      });
  }
]);
