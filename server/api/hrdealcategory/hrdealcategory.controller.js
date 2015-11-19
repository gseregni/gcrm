'use strict';

var _ = require('lodash');

var config = require('../../config/environment');
// config.highriseUrl is the base highrise url


var Client = require('node-rest-client').Client;
 
var parser = require('xml2json');

// Get list of hrdealcategorys
exports.index = function(req, res) {
  var reqparam = req.query;

  var options = {
  					 headers:{"Accept":"application/xml"},
  					 user:  reqparam.token, 
  					 password:"X"
  				};
  var client = new Client(options);


  if(!reqparam.country || (reqparam.country !== 'ITA' && reqparam.country !== 'SWI'))
    return res.status(500).send({err: 500, message: "Invalid Param [Azienda] = [" + reqparam.country + "]"  });
  	
  var url = (reqparam.country === 'ITA' ? config.itaHighriseUrl : config.swiHighriseUrl) + "/deal_categories.xml";
  
  var apireq = client.get(url, options, function(data, response){
    
  	var jsonData = parser.toJson(data);
    var parsedData = data ? JSON.parse(jsonData) : null;
		//console.log("parsedData",parsedData)

    res.json(parsedData);
  });


	//it's usefull to handle request errors to avoid, for example, socket hang up errors on request timeouts
	apireq.on('error', function(err){
	    res.json({ error: err, data: null});
	});
};