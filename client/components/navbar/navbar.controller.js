'use strict';

angular.module('galimbertiCrmApp')
  .controller('NavbarCtrl', function ($rootScope, $scope, $location, $modal, localStorageService) {
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

    $scope.authorizeTrello = function(){
      console.log("authorizeTrello")

      $scope.modalInstance = $modal.open({
            templateUrl: 'components/modal/authorize-trello-modal.html',
            scope: $scope,
            size: 'md'
      });
    }

    $scope.saveTrelloTokens = function(){
      // TODO insert tokens in local storage

      if($scope.modalInstance)
          $scope.modalInstance.dismiss();
    }


  });