'use strict';

var _ = require('lodash');
var fs = require('fs');

var config = require('../../config/environment');
// config.highriseUrl is the base highrise url


var Client = require('node-rest-client').Client;
 
var parser = require('xml2json');


// Get Highrise deal
exports.deal = function(req, res) {
  
  var reqparam = req.query;
  console.log("parsedData",reqparam.dealurl)
  var options = {
  					 headers:{"Accept":"application/xml"},
  					 user:  reqparam.token, 
  					 password:"X"
  				};
  var client = new Client(options);

  	
  var apireq = client.get(reqparam.dealurl + ".xml", options, function(data, response){
      var jsonData = parser.toJson(data);
    	var parsedData = data ? JSON.parse(jsonData) : null;
    		
      res.json({ data: parsedData});
      
	});


	//it's usefull to handle request errors to avoid, for example, socket hang up errors on request timeouts
	apireq.on('error', function(err){
	    return res.json({ error: err, data: null});
	});
};


// Update Highrise deal
exports.updateDeal = function(req, res) {
	  var reqparams = req.body;

	  var options = {
  					 headers:{"Content-Type" : "application/xml"},
  					 user:  reqparams.token,
  					 password:"X",
  					 data: "<deal>" + 
                    "<name>" + reqparams.name + "</name>" +
                    "<responsible-party-id>" + reqparams.responsiblePartyId + "</responsible-party-id>" +
                    "<category-id>" + reqparams.categoryId + "</category-id>" +
                   "</deal>"
  				};
  	
  	var client = new Client(options);

    if(reqparams.country !== 'ITA' && reqparams.country !== 'SWI')
      res.json({ error: "Invalid Parameter [Azienda]=" + reqparams.country,  data: null});
    else{
    	var updUrl = (reqparams.country === 'ITA' ? config.itaHighriseUrl : config.swiHighriseUrl) + "/deals/" + reqparams.id + ".xml?reload=true"
    	//console.log("update url ",updUrl);
    	//console.log("Options",options);

    	var apireq = client.put(updUrl, options, function(data, response){
    		var jsonData = parser.toJson(data);
    		var parsedData = data ? JSON.parse(jsonData) : null;
    		//console.log("parsedData for update",parsedData)

        res.json({ error: null,  data: parsedData});
    	});


    	//it's usefull to handle request errors to avoid, for example, socket hang up errors on request timeouts
    	apireq.on('error', function(err){
    	    res.json({ error: err, data: null});
    	});
    }


}


/*
curl -u 0b7bc01934a438ff224d9f0be9da7c29:X -X PUT -H 'Content-Type: application/xml' \
-d '<deal><name>Prova Curl</name></deal>' https://swissgalimbertisa.highrisehq.com/deals/4557047.xml

*/