'use strict';

angular.module('galimbertiCrmApp')
  .controller('NavbarCtrl', function ($rootScope, 
                                      $scope, 
                                      $location, 
                                      $modal,
                                      $timeout,
                                      localStorageService) {
    $scope.menu = [{
      'title': 'Home',
      'link': '/'
    }];

    $scope.isCollapsed = true;

    

    $scope.isActive = function(route) {
      return route === $location.path();
    };

    $scope.authorizeHighRise = function(){
      $rootScope.tokenIta = localStorageService.get('hrtokenIta');
      $rootScope.tokenSwi = localStorageService.get('hrtokenSwi');
      
      $scope.modalInstance = $modal.open({
            templateUrl: 'components/modal/authorize-highrise-modal.html',
            scope: $scope,
            size: 'md'
      }); 
    }

    $scope.saveHighriseTokens = function(){
                
        localStorageService.set('hrtokenIta', this.tokenIta);
        localStorageService.set('hrtokenSwi', this.tokenSwi);

        if($scope.modalInstance)
          $scope.modalInstance.dismiss();
    }
    



    $scope.authorizeGDrive = function(){
      console.log("authorizeGDrive")

      $scope.modalInstance = $modal.open({
            templateUrl: 'components/modal/authorize-gdrive-modal.html',
            scope: $scope,
            size: 'md'
      });
    }

    $scope.saveGDriveTokens = function(){
      // TODO insert tokens in local storage

      if($scope.modalInstance)
          $scope.modalInstance.dismiss();
    }

    var authenticationSuccess = function() { 
                                  console.log("Trello ")
                                  Trello.get("/tokens/" + Trello.token() + "/member/fullName",function(res){
                                      $rootScope.trelloToken = Trello.token();
                                      $rootScope.trelloFullName = res._value;  
                                      $scope.$digest();                                    
                                  })
                                }; 

    var authenticationFailure = function() { console.log("Failed authentication"); };

    $rootScope.authorizeTrello = function(){
        console.log("authorize trello")
        Trello.authorize({
          type: "popup",
          name: "Getting Started Application",
          scope: {
            read: true,
            write: true 
          },
          expiration: "never",
          success:  authenticationSuccess,
          error:    authenticationFailure
        });
    }

    

    $scope.saveTrelloTokens = function(){
      // TODO insert tokens in local storage

      if($scope.modalInstance)
          $scope.modalInstance.dismiss();
    }

    var checkTrelloToken = function(){
       
       Trello.authorize({type: "popup",
                         success:  authenticationSuccess,
                         error:    authenticationFailure});
       
    }

    checkTrelloToken();


  });