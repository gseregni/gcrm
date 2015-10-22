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

    $scope.loginTrello = function() {

    }

    $scope.loginHighrise = function() {

    }

    $scope.loginGoogle = function() {

    }

  });

/******************** TRELLO ********************************/  
var updateLoggedIn = function() {
    var isLoggedIn = Trello.authorized();
    $("#loggedout").toggle(!isLoggedIn);
    $("#loggedin").toggle(isLoggedIn);        
};

var logout = function() {
    Trello.deauthorize();
    updateLoggedIn();
};

var onAuthorize = function() {
    Trello.members.get("me", function(member){
      $("#fullName").text(member.fullName);
    });
    updateLoggedIn();
}

Trello.authorize({
    interactive:false,
    success: onAuthorize
});

$("#connectLink")
  .click(function(){
      Trello.authorize({
          persist : true,
          type: "popup",
          scope: { read: true, write: true },
          success: onAuthorize
      })
  });

$("#disconnect").click(logout);
updateLoggedIn();
/******************** FINISH TRELLO ********************************/


/******************** GOOGLE API ***********************************/

var CLIENT_ID = '510967541357-rraof5bej57t4j9gbsl9nkkn21oghd31.apps.googleusercontent.com';
var SCOPES = 'https://www.googleapis.com/auth/drive';


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
    // filePicker.style.display = 'block';
    // filePicker.onclick = uploadFile;          
  } else {
    // No access token could be retrieved, show the button to start the authorization flow.
    authButton.style.display = 'block';
    authButton.onclick = function() {
        gapi.auth.authorize({
          'client_id': CLIENT_ID,
          'scope': SCOPES,
          'immediate': false}, handleAuthResult);
    };
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

/**
 * Called when the client library is loaded to start the auth flow.
 */
function handleClientLoad() {
  window.setTimeout(checkAuth, 1);
}

/******************** FINISH GOOGLE *********************************/







/***************** HIGHRISE *********************************************/
function openModalToken(){
  $('#myModal').modal();
}
function saveToken(){
  localStorage.setItem("htoken", $('#htoken').val());
  console.log(localStorage);
}
/*********** FINISH HIGHRISE ***************/


