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
  var accessToken;  

      
  var init = function() {
    gapi.client.setApiKey(apiKey);
    gapi.client.load('drive', 'v2')
    //console.log("gapi loaded")
    gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: true}, handleAuthResult);
  }

  function handleAuthResult(authResult) {
    accessToken = authResult.access_token;
    //console.log("Access Token",accessToken)
  }

  function onSignIn(googleUser) {
    //console.log(googleUser);
    /*var profile = googleUser.getBasicProfile();
    
    console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
    console.log('Name: ' + profile.getName());
    console.log('Image URL: ' + profile.getImageUrl());
    console.log('Email: ' + profile.getEmail());*/

    init();
  }

  function signOut() {
      var auth2 = gapi.auth2.getAuthInstance();
      auth2.signOut().then(function () {
        console.log('User signed out.');
        auth2.disconnect();
      });

  }