/**
 * Main application routes
 */

'use strict';

var errors = require('./components/errors');
var path = require('path');

module.exports = function(app) {

  // Insert routes below
  app.use('/api/hrdealnotes', require('./api/hrdealnote'));
  app.use('/api/hrdealcategories', require('./api/hrdealcategory'));
  app.use('/api/drive', require('./api/drive'));
  app.use('/api/hrdeals', require('./api/hrdeal'));
  app.use('/api/hrpeople', require('./api/hrpeople'));
  
  
  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get(function(req, res) {
      res.sendFile(path.resolve(app.get('appPath') + '/index.html'));
    });
};
