'use strict';

/**
 * @ngdoc overview
 * @name gioApp
 * @description
 * # gioApp
 *
 * Main module of the application.
 */

angular
  .module('gcrmApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'main'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl',
        controllerAs: 'about'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
  .controller('AppCtrl', function($scope, $rootScope, $location) {

    /******************** TRELLO ********************************/  
    Trello.authorize({
        interactive:false,
        success: onAuthorize
    });

    var onAuthorize = function() {
      Trello.members.get("me", function(member){
        $("#fullName").text(member.fullName);
      });
      updateLoggedIn();
    }

    var updateLoggedIn = function() {
        var isLoggedIn = Trello.authorized();
        $("#loggedout").toggle(!isLoggedIn);
        $("#loggedin").toggle(isLoggedIn);        
    };

    $scope.loginTrello = function() {
      Trello.authorize({
          persist : true,
          type: "popup",
          scope: { read: true, write: true },
          success: onAuthorize
      })
    }

    $scope.logoutTrello = function() {
      Trello.deauthorize();
      updateLoggedIn();
    }

    updateLoggedIn();
    /******************** FINISH TRELLO ********************************/


    /******************** GOOGLE API ***********************************/
    var CLIENT_ID = '510967541357-rraof5bej57t4j9gbsl9nkkn21oghd31.apps.googleusercontent.com';
    var SCOPES = 'https://www.googleapis.com/auth/drive';

    /**
     * Called when the client library is loaded to start the auth flow.
     */
    function handleClientLoad() {
      window.setTimeout(checkAuth, 1);
    }

    /**
     * Called when authorization server replies.
     *
     * @param {Object} authResult Authorization result.
     */
    function handleAuthResult(authResult) {
      var authButton = document.getElementById('authorizeButton');
      // var filePicker = document.getElementById('publish');
      authButton.style.display = 'none';
      // filePicker.style.display = 'none';
      if (authResult && !authResult.error) {
        // Access token has been successfully retrieved, requests can be sent to the API.
 
      } else {
        // No access token could be retrieved, show the button to start the authorization flow.
        authButton.style.display = 'block';
      }
    }

    /**
     * Check if the current user has authorized the application.
     */
    function checkAuth() {
      gapi.auth.authorize({
        'client_id': CLIENT_ID,
        'scope': SCOPES,
        'immediate': true}, handleAuthResult);
    }


    $scope.loginGoogle = function() {
      gapi.auth.authorize({
              'client_id': CLIENT_ID,
              'scope': SCOPES,
              'immediate': false}, handleAuthResult);
    }

    /******************** FINISH GOOGLE *********************************/


    /***************** HIGHRISE *********************************************/
    $scope.loginHighrise = function() {
      $('#myModal').modal();
    }

    $scope.saveToken = function() {
      localStorage.setItem("htoken", $('#htoken').val());
    }
    /*********** FINISH HIGHRISE ***************/

  });




















