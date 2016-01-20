'use strict';

angular.module('galimbertiCrmApp')
  .factory('HighRiseDeal', function ($resource) {
    return $resource('/api/hrdeals/:id', {
      id: '@_id'
    },
    {
      update: {
        method: 'PUT',
      }
    });
  })
  .factory('HighRisePeople', function ($resource) {
    return $resource('/api/hrpeople', { }, { } );
  })
  .factory('HighRiseDealCategory', function ($resource) {
    return $resource('/api/hrdealcategories', { }, { } );
  })
  .factory('HighRiseNotes', function ($resource) {
    return $resource('/api/hrdealnotes/:id', {
      id: '@_id'
    },
    {
      update: {
        method: 'PUT',
      }
    });
  })
  .factory('HighRiseCustomFields', function ($resource) {
    return $resource('/api/hrdealcustomfields/:id', {
      id: '@_id'
    },
    {
      update: {
        method: 'PUT',
      }
    });
  });