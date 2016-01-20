'use strict';

angular.module('galimbertiCrmApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('main_old', {
        url: '/',
        templateUrl: 'app/main/main.html',
        controller: 'MainCtrl'
      });
  });