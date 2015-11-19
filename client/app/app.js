'use strict';

angular.module('galimbertiCrmApp', [
                                    'ngCookies',
                                    'ngResource',
                                    'ngSanitize',
                                    'ui.router',
                                    'ui.bootstrap',
                                    'angularjs-dropdown-multiselect',
                                    'LocalStorageModule'
                                   ])
.config(function ($stateProvider, $urlRouterProvider, $locationProvider, localStorageServiceProvider) {
    localStorageServiceProvider.setPrefix('gcrm');

    $urlRouterProvider
      .otherwise('/');

    $locationProvider.html5Mode(true);
  });



  var clientId="246770070242-61imh7fej22jkonn8a58ppssbq7391b2.apps.googleusercontent.com";
  var apiKey = "AIzaSyC9vVAApxr8-ury3bK2Y3NYIADMb5QykXs";
  var scopes ="https://www.googleapis.com/auth/drive";
      

      
  var init = function() {
    gapi.client.setApiKey(apiKey);
    gapi.client.load('drive', 'v2')
    console.log("gapi loaded")
  }