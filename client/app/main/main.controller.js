'use strict';

angular.module('galimbertiCrmApp')
  .controller('MainCtrl', function ($rootScope, 
                                    $scope, 
                                    $state,
                                    $http, 
                                    $q, 
                                    $timeout,
                                    $interval,
                                    $modal, 
                                    $location,
                                    $window,
                                    localStorageService, 
                                    HighRiseDeal,
                                    HighRisePeople,
                                    HighRiseDealCategory,
                                    HighRiseNotes,
                                    HighRiseCustomFields) {
	   


  		$scope.hrtokenIta =  localStorageService.get("hrtokenIta");  
  		$scope.hrtokenSwi  = localStorageService.get("hrtokenSwi");  

  		var swiHighriseUrl = "https://swissgalimbertisa.highrisehq.com/deals",
  			  itaHighriseUrl = "https://galimbertisrl1.highrisehq.com/deals";


  		$scope.jobTypeModel = {};
	    $scope.jobTypeOptions = [];


	    $scope.jobTypeSettings = {
		                            closeOnSelect:  true,
		                            selectionLimit: 1,
		                              smartButtonMaxItems: 1,
		                              smartButtonTextConverter: function(itemText, originalItem) {
		                                  return originalItem.label;
		                              }
		                         };


      $scope.managerModel = {};
      $scope.managerOptions = [];


      $scope.managerSettings = {
                                closeOnSelect:  true,
                                selectionLimit: 1,
                                  smartButtonMaxItems: 1,
                                  smartButtonTextConverter: function(itemText, originalItem) {
                                      return originalItem.label;
                                  }
                             };   






		
      var getCountryDeal = function(country,countryImg){
        if(country !== "Svizzera" && country !== "Italia"){
          console.log("Invalid country: Italia or Svizzera admitted")
          $scope.hrValidationMsg = "Invalid country: Italia or Svizzera admitted";
          return;
        }

        var hrToken = country === "Svizzera" ? $scope.hrtokenSwi : $scope.hrtokenIta;
        var highriseUrl = country === "Svizzera" ? swiHighriseUrl : itaHighriseUrl;


        $scope.dealCountry = country;
        $scope.dealCountryImg = countryImg;

        var dealurl = $scope.dealurl

        // init highrise note
        $scope.hrnote = null;
        // init gdrive link
        $scope.gdrivelink = null;
        $scope.gdriveOrderLink = null;

        if(dealurl.indexOf("/edit") != -1)
          dealurl = dealurl.substring(0,dealurl.indexOf("/edit"));

        HighRiseDeal.get({dealurl: dealurl, token: hrToken},function(deal){
          //console.log("Highrise deal",deal)
          $scope.hrdeal = deal;

          if(deal.data.deal){
            HighRisePeople.get({country: countryImg, token: hrToken},function(people){
              $scope.managerOptions = [];
              if(people.users && people.users.user && people.users.user.length){
                var users = people.users.user;
                users.forEach(function(d){
                  $scope.managerOptions.push({id: d.id['$t'] , label: d.name}) ;
                });
                $scope.managerModel.id = deal.data.deal['responsible-party-id']['$t'];
              }
            }); // end HighRisePeople.get

            HighRiseDealCategory.get({country: countryImg , dealurl: dealurl, token: hrToken},function(cats){
                  $scope.jobTypeOptions = [];
                  if(cats['deal-categories'] && cats['deal-categories']['deal-category'] && cats['deal-categories']['deal-category'].length){
                    var categories = cats['deal-categories']['deal-category'];
                    categories.forEach(function(d){
                      $scope.jobTypeOptions.push({id: d.id['$t'] , label: d.name}) ;
                    });
                    $scope.jobTypeModel.id = deal.data.deal['category-id']['$t'];
                  }

            });

            var dealId = $scope.hrdeal.data.deal.id['$t']
            HighRiseNotes.get({dealurl: highriseUrl + "/" + dealId + "/notes", token: hrToken},
                                    function(notes){
                                        console.log("Notes",notes)
                                        if(notes.data.notes && notes.data.notes.note && notes.data.notes.note.body)
                                          $scope.hrnote = notes.data.notes.note.body;
                                        else if(notes.data.notes && notes.data.notes.note && notes.data.notes.note.length)
                                          $scope.hrnote = notes.data.notes.note[0].body; 

                                        
                                        if($scope.hrnote)
                                        {
                                          var customFields = $scope.hrnote.split("\n");
                                          if(customFields.length){
                                              for(var i=0; i < customFields.length; i++){
                                                if(customFields[i].length && customFields[i].indexOf("CantierePlaceId: ") != -1)
                                                  $scope.constructionSitePlaceId = customFields[i].substring("CantierePlaceId: ".length,customFields[i].length);
                                                else if(customFields[i].length && customFields[i].indexOf("Cantiere: ") != -1)
                                                  $scope.constructionSite = customFields[i].substring("Cantiere: ".length,customFields[i].length);
                                                else if(customFields[i].length && customFields[i].indexOf("Descrizione: ") != -1)
                                                  $scope.jobDescription = customFields[i].substring("Descrizione: ".length,customFields[i].length);
                                                else if(customFields[i].length && customFields[i].indexOf("Link GDrive: ") != -1)
                                                  $scope.gdrivelink = customFields[i].substring("Link GDrive: ".length,customFields[i].length);
                                                else if(customFields[i].length && customFields[i].indexOf("Link Gsheet: ") != -1)
                                                  $scope.gsheetlink = customFields[i].substring("Link Gsheet: ".length,customFields[i].length);
                                                else if(customFields[i].length && customFields[i].indexOf("Link Trello: ") != -1)
                                                  $scope.trelloLink = customFields[i].substring("Link Trello: ".length,customFields[i].length)
                                              }
                                          }
                                          

                                          $scope.setPositionMarker();
                                        }

                                        var baseTrelloLink = "https://trello.com/c/";
                                        if($scope.trelloLink && $scope.trelloLink.length >= baseTrelloLink.length + 8){
                                            var cardId = $scope.trelloLink.substring(baseTrelloLink.length,baseTrelloLink.length + 8)
                                            if(cardId)
                                              // get grive folder from Trello
                                              Trello.get("/cards/" + cardId)
                                                    .then(function(card){
                                                      if(card.desc){
                                                        var ordineVendita = "**Cartella Ordine Vendita**";
                                                        var idxOrdineVendita = card.desc.indexOf(ordineVendita);

                                                        var calcoloPreventivo = "**Calcolo Preventivo e Contratto**"
                                                        var idxCalcoloPreventivo = card.desc.indexOf(calcoloPreventivo);

                                                        var dealHighrise = "**Deal Highrise**"
                                                        var idxDealHighrise = card.desc.indexOf(dealHighrise);


                                                        $scope.shortTrelloLink = card.shortUrl;
                                                        
                                                        if(idxOrdineVendita != -1 && idxCalcoloPreventivo != -1){
                                                          $scope.gdrivelink = card.desc.substring(ordineVendita.length,idxCalcoloPreventivo);
                                                          if($scope.gdrivelink)
                                                            $scope.gdrivelink = $scope.gdrivelink.trim();
                                                        }

                                                        if(idxCalcoloPreventivo != -1 && idxDealHighrise != -1){
                                                          $scope.gdriveOrderLink = card.desc.substring(idxCalcoloPreventivo + calcoloPreventivo.length,idxDealHighrise);
                                                          if($scope.gdriveOrderLink)
                                                            $scope.gdriveOrderLink = $scope.gdriveOrderLink.trim();

                                                        }


                                                        $scope.$digest();
                                                      }
                                                    });
                                        }  

                                    }); // end Highrise.getNotes
          } // end if(deal.data.deal)

        }); // end HighRiseDeal.get


      }
          


  		$scope.getHighRiseDeal = function(){

        populateFolders();
        
  			$scope.hrtokenIta =  localStorageService.get("hrtokenIta");   
  			$scope.hrtokenSwi  = localStorageService.get("hrtokenSwi");  
  			$scope.hrdeal = null;
  			$scope.hrValidationMsg = null;


  			if(!$scope.dealurl || ($scope.dealurl.indexOf(swiHighriseUrl) == -1 && $scope.dealurl.indexOf(itaHighriseUrl) == -1)){
  				$scope.hrValidationMsg = "Il link inserito non è un deal valido";
  			}
  			else if(!$scope.hrtokenIta && $scope.dealurl.indexOf(itaHighriseUrl) != -1)
  				$scope.hrValidationMsg = "Non hai inserito il token Highrise per la società italiana";
  			else if(!$scope.hrtokenSwi && $scope.dealurl.indexOf(swiHighriseUrl) != -1)
  				$scope.hrValidationMsg = "Non hai inserito il token Highrise per la società svizzera";
  			// valid path
  			else if($scope.dealurl.indexOf(swiHighriseUrl) != -1){
          getCountryDeal("Svizzera","SWI");
  			}
  			else if($scope.dealurl.indexOf(itaHighriseUrl) != -1){
          getCountryDeal("Italia","ITA");
          
  			}
  		}

      $scope.invalidateDeal = function(){
        $scope.hrdeal = null;
        $scope.hrValidationMsg = "E' necessario validare il deal"
      }

  		$scope.updateHRDeal = function(){
        
  			if($scope.hrdeal){
          var customer = $scope.hrdeal.data.deal.party.name;
          var dealId = $scope.hrdeal.data.deal.id['$t'];
  				var author;  
          if($scope.managerOptions.length && $scope.managerModel.id)
            $scope.managerOptions.forEach(function(d){
              if(d.id === $scope.managerModel.id){
                if(d.label.indexOf(" ") == -1)
                  author = d.label.toUpperCase().substring(0,3);
                else{
                  author = d.label.toUpperCase().charAt(0) + d.label.toUpperCase().charAt(d.label.indexOf(" ") + 1) + "K"
                }

              }
            })

          
          var jobType = "A";
          if($scope.jobTypeModel && $scope.jobTypeModel.id)
            $scope.jobTypeOptions.forEach(function(d){
              if(d.id === $scope.jobTypeModel.id)
                jobType = d.label.charAt(0);
            })
          

          //console.log("city name",$scope.cityName)
          $scope.updDealName = customer + " - " +
              							   "Cantiere in " + $scope.cityName + " - " +
              							   $scope.jobDescription + " - " +
              							   dealId + " - " +
              							   author + " - " +
              							   jobType;

          //console.log("Deal Name",$scope.updDealName)

  				var token;
  				var country;
  				if($scope.dealurl.indexOf(swiHighriseUrl) != -1){
  					token = $scope.hrtokenSwi;
  					country = "SWI";
  				}
  				else if($scope.dealurl.indexOf(itaHighriseUrl) != -1){
  					token = $scope.hrtokenIta;
  					country = "ITA";
  				}

  				var hrd = new HighRiseDeal({
                  										id: $scope.hrdeal.data.deal.id['$t'],
                  										token: token,
                  										name: $scope.updDealName,
                                      responsiblePartyId: $scope.managerModel.id,
                                      categoryId: $scope.jobTypeModel.id,
                  										country: country
                  									  });
          var oldJobCategory;

          console.log("$scope.hrdeal.data.deal",$scope.hrdeal.data.deal)

          $scope.jobTypeOptions.forEach(function(o){
            if($scope.hrdeal.data.deal.category && o.id === $scope.hrdeal.data.deal.category.id['$t'])
              oldJobCategory = o.label;  
          })

  				hrd.$update(function(res){
  					console.log("Result",res);
  					$scope.hrdeal = res;
            $scope.resultDealName = res.data.deal.name;



            // Upsert Trello
            if(res && res.data.deal && (country === "SWI" || country == "ITA")){
              //console.log("Update Trello Card")
              upsertTrelloCard(res.data.deal.id['$t'], $scope.dealurl, res.data.deal.name,customer,oldJobCategory)
            }
            // TODO: Upsert Trello for 'ITA'

  				})

  			}else
  				$scope.hrValidationMsg = "Invalid Link";
  		}


      $scope.adjustResult = function(){
        $scope.constructionSite = this.constructionSite;
      }

      var updateHRNotes = function(dealId,openHighrise){

        var token = $scope.dealCountry === "Svizzera" ?  $scope.hrtokenSwi : ($scope.dealCountry === "Italia" ? $scope.hrtokenIta : null);  
        var country = $scope.dealCountry === "Svizzera" ?  "SWI" : ($scope.dealCountry === "Italia" ? "ITA" : null); 
        var url =  $scope.dealCountry === "Svizzera" ?  swiHighriseUrl : ($scope.dealCountry === "Italia" ? itaHighriseUrl : null); 

        if(token && country && url){
                  HighRiseNotes.get({dealurl: url + "/" + dealId + "/notes", token: token},
                                    function(result){
                                      //console.log("Notes from Highrise",result.data.notes,result.data.notes.note);

                                      var bodyText = "CantierePlaceId: "  + $scope.constructionSitePlaceId + "\n" +
                                                     "Cantiere: "         + $scope.constructionSite + "\n" + 
                                                     "Descrizione: "      + $scope.jobDescription + "\n" +
                                                     "Link GDrive: "      + $scope.gdrivelink +  "\n" +
                                                     "Link Gsheet: "      + $scope.gsheetlink +  "\n" +
                                                     "Link Trello: "      + $scope.trelloLink;


                                      if(!result.data.notes || !result.data.notes.note)
                                      {
                                          var note = new HighRiseNotes({ dealurl: url + "/" + dealId + "/notes", 
                                                                         body: bodyText, 
                                                                         id: dealId,
                                                                         token: token,
                                                                         country: country});
                                          note.$save(function(savedNotes){
                                            //console.log("Saved Notes",savedNotes);
                                          })
                                      
                                      }else{

                                        HighRiseNotes.update({ dealurl: url + "/" + dealId + "/notes" , 
                                                               body: bodyText, 
                                                               id: result.data.notes.note.length ? result.data.notes.note[0].id['$t'] : result.data.notes.note.id['$t'],
                                                               dealId: dealId,
                                                               token: token,
                                                               country: country
                                                            },
                                        function(updatedNote){
                                          //reloadHRNotes(dealId,'SWI');
                                          if(openHighrise)
                                            $window.open( url + '/' + $scope.hrdeal.data.deal.id['$t'], '_blank');
                                        })
                                      }
                                    });
        }
      }


      
      function reloadHRNotes(dealId,country){
        var token = country === "SWI" ?  $scope.hrtokenSwi : (country === "ITA" ? $scope.hrtokenIta : null);
        var url = country === "SWI" ?  swiHighriseUrl : (country === "ITA" ? itaHighriseUrl : null);


        if(token && url)
          HighRiseNotes.get({dealurl: url + "/" + dealId + "/notes", token: token},
                                       function(notes){
                                          //console.log("Notes",notes)
                                          if(notes.data.notes && notes.data.notes.note){
                                            $scope.hrnote = notes.data.notes.note.body;

                                            var customFields = $scope.hrnote.split("\n");
                                            if(customFields.length){
                                              for(var i=0; i < customFields.length; i++){
                                                if(customFields[i].length && customFields[i].indexOf("CantierePlaceId: ") != -1)
                                                  $scope.constructionSitePlaceId = customFields[i].substring("CantierePlaceId: ".length,customFields[i].length);
                                                else if(customFields[i].length && customFields[i].indexOf("Cantiere: ") != -1)
                                                  $scope.constructionSite = customFields[i].substring("Cantiere: ".length,customFields[i].length);
                                                else if(customFields[i].length && customFields[i].indexOf("Descrizione: ") != -1)
                                                  $scope.jobDescription = customFields[i].substring("Descrizione: ".length,customFields[i].length);
                                                else if(customFields[i].length && customFields[i].indexOf("Link GDrive: ") != -1)
                                                  $scope.gdrivelink = customFields[i].substring("Link GDrive: ".length,customFields[i].length);
                                                else if(customFields[i].length && customFields[i].indexOf("Link Gsheet: ") != -1)
                                                  $scope.gsheetlink = customFields[i].substring("Link Gsheet: ".length,customFields[i].length);
                                                else if(customFields[i].length && customFields[i].indexOf("Link Trello: ") != -1)
                                                  $scope.trelloLink = customFields[i].substring("Link Trello: ".length,customFields[i].length)
                                              }
                                            }
                                            
                                            $scope.setPositionMarker();
                                          }
                                        });
      }

      



      ///////////////////////////////////////////////////////////////////////////////////////////
      //                    GDRIVE Section                                                     //
      ///////////////////////////////////////////////////////////////////////////////////////////

      // TODO: remove
      //var clientId="465342850022-uccefd9aoqoqum18ctcvg9vai1no554a.apps.googleusercontent.com";
      //var apiKey = "AIzaSyAggTg6GPKQt710bFV4RiUfByLlKR1BGjg";
      //var scopes = ["https://www.googleapis.com/auth/drive"];
      //var accessToken;
      $rootScope.googleSignInObject;

      /*  TODO: remove
      var PREV_PAVIMENTI_ID_15  = "0B-mS2CSkk6pxaXl1TUd6R3hKWGM";
      var PREV_OUTDOOR_ID_15    = "0B-mS2CSkk6pxfmVxMDJ3TU11b04xYmx4Zi1ibGc4aG9VTjNRdTVpTko5aVN6WG9NZ1VKQk0";
      var PREV_CASE_ID_15       = "0B-mS2CSkk6pxfjFVd2JTUXFlRUljWThLX2loSWNVSnN4djJzamdIN3lxd25TOVlrRUlFMjA";
      var PREV_TETTI_ID_15      = "0B-mS2CSkk6pxfnJWbFVBRGNmcldFYTdVNUE0cFNUdFNvRXdmTDhnaE9ka2s1Zy10WjdPVDQ";*/

       
      var TETTI_ID      = "0B-mS2CSkk6pxTDk3WUZPRnZ3Rzg"; 
      var PAVIMENTI_ID  = "0B-mS2CSkk6pxVENtSTFUbFpfRG8";
      var OUTDOOR_ID    = "0B-mS2CSkk6pxREJzRGZraTF0aW8";
      var CASE_ID       = "0B-mS2CSkk6pxUndETlNzYVhwa3M";
      
       

      var gdriveFolders;

      var swiFolders = [{title: 'CH - Preventivi Tetti'    ,  fileId: TETTI_ID,        label: 'TETTI'      },
                        {title: 'CH - Preventivi Pavimenti',  fileId: PAVIMENTI_ID,    label: 'PARQUET'     },
                        {title: 'CH - Preventivi Outdoor'  ,  fileId: OUTDOOR_ID,      label: 'OUTDOOR'     },
                        {title: 'CH - Preventivi Case'     ,  fileId: CASE_ID,         label: 'COSTRUZIONI' }
                       ];

      var itaFolders = [{title: '- IT - Preventivi Tetti'    ,  fileId: "0B-mS2CSkk6pxQmN3dDNlOEx6bGM",         label: 'TETTI'      },
                        {title: '- IT - Preventivi Pavimenti'           ,  fileId: "0B-mS2CSkk6pxT3JsekhZWlRKdEE",         label: 'PARQUET'     },
                        {title: '- IT - Preventivi Outdoor'             ,  fileId: "0B-mS2CSkk6pxdkktSjdZazlEMzQ",         label: 'OUTDOOR'     },
                        {title: '- IT - Preventivi Case'                ,  fileId: "0B-mS2CSkk6pxM1hGLUI0R1pqYzA",         label: 'COSTRUZIONI' }
                       ];

      
      var folderTitles = [{title: "0-9"},
                          {title: "A"},
                          {title: "B"},
                          {title: "C-CK"},
                          {title: "CL-CZ"},
                          {title: "D"},
                          {title: "E"},
                          {title: "F-G"},
                          {title: "H-I-J-K-L"},
                          {title: "M"},
                          {title: "N-O"},
                          {title: "P-Q"},
                          {title: "R"},
                          {title: "S"},
                          {title: "T"},
                          {title: "U-V-W-Y-Z"}
                        ];

      
      $scope.gdriveLoggedin;

      $rootScope.gDriveLogin=function() {
        $timeout(function(){
                              gapi.client.setApiKey(apiKey);
                              gapi.load('auth2', function() {
                                gapi.auth2.init({client_id: clientId});
                              });
                              gapi.client.load('drive', 'v2').then(checkAuth);
                            },100);
      };

      
     

      var checkGDriveFolders = function(customer,dealId,title){

        var currentYear = new Date().getFullYear();
        var previousYear = currentYear - 1;

        

       
        
        var request = gapi.client.request({
                                              'path': '/drive/v2/files',
                                              'method': 'GET',
                                              'params': {
                                                  'maxResults': '100',
                                                  'q': "mimeType = 'application/vnd.google-apps.folder' and title contains  '" + dealId + "'" //and '" + fld.fileId + "' in parents",

                                               }
                                          });
        
        request.then(function(resp){
          
          if(resp.result.items && resp.result.items.length){
            var itemFound;
            for(var i=0; i < resp.result.items.length; i++){
              var item = resp.result.items[i];
              if(!item.explicitlyTrashed && item.parents.length){
                itemFound = item;
                break;
              }
            }
            if(itemFound){
              var parRequest = gapi.client.drive.files.get({
                                                              'fileId': itemFound.parents[0].id
                                                            });
              parRequest.then(function(resp){
                if(resp.result && resp.result.parents.length){
                  var parentRootRequest = gapi.client.drive.files.get({
                                                              'fileId': resp.result.parents[0].id
                                                            }); 
                  parentRootRequest.then(function(response){
                    if(response.result.title.indexOf(currentYear) != -1)
                      return verifyFoldersThenMoveOrCopy(customer,dealId,title,currentYear); 
                    else if(response.result.title.indexOf(previousYear) != -1)
                      return  verifyFoldersThenMoveOrCopy(customer,dealId,title,previousYear); 
                  });
                  

                }
              })
            }
            else{
              console.log("verifyFoldersThenMoveOrCopy",customer,dealId,title,currentYear)
              return  verifyFoldersThenMoveOrCopy(customer,dealId,title,currentYear);
            }
          }else{
            console.log("Create folder for deal",dealId)
            // create folder
            return  verifyFoldersThenMoveOrCopy(customer,dealId,title,currentYear); 
          }



        });

        

      }

      


      var verifyFoldersThenMoveOrCopy = function(customer,dealId,title,year){
        
        /* search folder destination for deal */
        var categoryLabel;

        $scope.jobTypeOptions.forEach(function(jt){
          if(jt.id === $scope.jobTypeModel.id)
            categoryLabel = jt.label;
        })

        

        // Folder containing updated deal
        var selectedFolder;
        if($scope.dealCountry === "Svizzera")
          swiFolders.forEach(function(f){
            if(f.label.toLowerCase() === categoryLabel.toLowerCase())
              selectedFolder = f;
          });
        else if($scope.dealCountry === "Italia"){
          if(categoryLabel === "COSTRUZIONI - in progetto" ||
             categoryLabel === "COSTRUZIONI - lavoro avviato" ||
             categoryLabel === "COSTRUZIONI - studio fattibilità" ||
             categoryLabel === "TERRENI")
          {
            selectedFolder = itaFolders[3];
          
          } else if(categoryLabel === "TETTI")
          {
            selectedFolder = itaFolders[0];
          }
          else if(categoryLabel === "G50 - in progetto" ||
                  categoryLabel === "G50 - lavoro avviato" ||
                  categoryLabel === "GBLINDS - in progetto" ||
                  categoryLabel === "GBLINDS - lavoro avviato" ||
                  categoryLabel === "GFASSADEN - in progetto" ||
                  categoryLabel === "GFASSADEN - lavoro avviato" ||
                  categoryLabel === "GSUNSCREEN - in progetto" ||
                  categoryLabel === "GSUNSCREEN - lavoro avviato")
          {

            selectedFolder = itaFolders[2];

          } else if(categoryLabel === "PARQUET")
            selectedFolder = itaFolders[1];

        }

        

        if(!selectedFolder && $scope.dealCountry === "Svizzera")
          selectedFolder = swiFolders[0];
        else if(!selectedFolder && $scope.dealCountry === "Italia")
          selectedFolder = itaFolders[0];

        var currentYearFolder  = selectedFolder.title + " " + year;
        //var previousYearFolder = "CH - Preventivi " + selectedFolder.label + " " + previousYear;

        var req = gapi.client.request({
                                            'path': '/drive/v2/files',
                                            'method': 'GET',
                                            'params': {
                                                'maxResults': '100',
                                                'q': "mimeType = 'application/vnd.google-apps.folder' and title =  '" + currentYearFolder + "'" //and '" + fld.fileId + "' in parents",

                                             }
                                    });

        /*                                              */
        /* load folder for currentYear                  */
        /*                                              */
        req.then(function(response){
          return response.result.items[0];
        }).then(function(parentFolder){

          var folderListReq = gapi.client.request({
                                            'path': '/drive/v2/files',
                                            'method': 'GET',
                                            'params': {
                                                'maxResults': '100',
                                                'q': "mimeType = 'application/vnd.google-apps.folder' and '" + parentFolder.id + "' in parents",

                                             }
                                    }); 

          folderListReq.then(function(fresult){
            //console.log("Folder List",fresult);
            if(fresult.result && fresult.result.items.length > 0){
              var gdriveItems = fresult.result.items;
              
              
              var beginChar;
              

              if(!isNaN(parseInt(customer.charAt(0))))
                beginChar = "0";
              else if(customer.toUpperCase().substring(0,2) >= 'C' && customer.toUpperCase().substring(0,2) <= 'CI'){
                //console.log("customer.toUpperCase().substring(0,2)",customer.toUpperCase().substring(0,2))
                beginChar = "C-";
              }
              else if(customer.toUpperCase().substring(0,2) > 'CI' && customer.toUpperCase().substring(0,2) <= 'CZ')
                beginChar = "CL";
              else if(customer.toUpperCase().charAt(0) == 'F' || customer.toUpperCase().charAt(0) == 'G')
                beginChar = "F";
              else if(customer.toUpperCase().charAt(0) == 'H' || customer.toUpperCase().charAt(0) == 'I' || customer.toUpperCase().charAt(0) == 'J' || customer.toUpperCase().charAt(0) == 'K' || customer.toUpperCase().charAt(0) == 'L')
                beginChar = "H";
              else if(customer.toUpperCase().charAt(0) == 'N' || customer.toUpperCase().charAt(0) == 'O')
                beginChar = "N";
              else if(customer.toUpperCase().charAt(0) == 'P' || customer.toUpperCase().charAt(0) == 'Q')
                beginChar = "P";
              else if(customer.toUpperCase().charAt(0) == 'U' || customer.toUpperCase().charAt(0) == 'V' || customer.toUpperCase().charAt(0) == 'W' || customer.toUpperCase().charAt(0) == 'Y' || customer.toUpperCase().charAt(0) == 'Z')
                beginChar = "U";
              else
                beginChar = customer.toUpperCase().charAt(0);

              



              /*                                              */
              /* find folder for deal                         */
              /*                                              */

              if(beginChar){
                
                for(var i=0; i < gdriveItems.length; i++){
                  if(gdriveItems[i].title.indexOf(beginChar) != -1 && !gdriveItems[i].explicitlyTrashed ){
                    //console.log("set new folder to ",gdriveItems[i])
                    /*                                    */
                    /* check if folder for deal exist     */
                    /*                                    */
                    //console.log("moveOrCopyGoogleFolder(dealId,gdriveItems[i],title)",dealId,gdriveItems[i],title)
                    moveOrCopyGoogleFolder(dealId,gdriveItems[i],title);
                    return;
                  }
                }
              }
              else
                console.log("Cannot find associated folder for customer",customer);
            }

          });
            
        });


      }

      function moveOrCopyGoogleFolder(dealId,destinationFolder,title){
        console.log("moveOrCopyGoogleFolder dealId,destinationFolder,title", dealId,destinationFolder,title)
        var currentYear = new Date().getFullYear();
        var previousYear = currentYear - 1;


        var request = gapi.client.request({
                                              'path': '/drive/v2/files',
                                              'method': 'GET',
                                              'params': {
                                                  'maxResults': '100',
                                                  'q': "mimeType = 'application/vnd.google-apps.folder' and title contains  '" + dealId + "'" //and '" + fld.fileId + "' in parents",

                                               }
                                          });

        request.then(function(resp){
          if(resp.result.items && resp.result.items.length){
            var itemFound;
            for(var i=0; i < resp.result.items.length; i++){
              var item = resp.result.items[i];
              if(!item.explicitlyTrashed && item.parents.length){
                itemFound = item;
                break;
              }
            }
            if(itemFound){
              console.log("itemFound",itemFound)
              if(itemFound.parents[0].id !== destinationFolder.id){
                      console.log("Move folder in " ,destinationFolder); 
                      
                      var file = itemFound;
                      var removeParents = [];
                      if(file.parents.length)
                        file.parents.forEach(function(p){
                          removeParents.push(p.id);
                        })
                      


                      var body = {'title': title};
                      //if(!parent)
                      //body.addParents = newgfolder.id;
                      //body.removeParents = removeParents.join();

                      var updRequest = gapi.client.drive.files.patch({
                            'fileId': file.id,
                            'resource': body,
                            'addParents': destinationFolder.id, 
                            'removeParents': removeParents.join()
                          });
                      updRequest.execute(function(upd) {
                        //console.log('Updated gdrive folder with new title', upd);
                        $scope.redirectToHighriseDeal();
                      });
                      
                      

              }
              else{
                //console.log("Don't move anything"); 
                $scope.redirectToHighriseDeal();
              }
                 
            }else{
              console.log("Item not found - Create folder for deal" , dealId,destinationFolder.id);
              $scope.copyTemplateFiles(destinationFolder.id,title);
            }
          }
          else{
              console.log("!resp.result.items - Create folder for deal" , dealId,destinationFolder.id);
              $scope.copyTemplateFiles(destinationFolder.id,title);
          }
        });

        
      }

      var populateFolders = function(){
        var batch = gapi.client.newBatch();

        if($scope.dealCountry === "Svizzera"){
          swiFolders.forEach(function(f){
            batch.add(setDealFoldersId(f),{id: f.fileId});
          })

          batch.then(function(response){
            if(response.result){

              var res = response.result;
              //console.log("gdriveFolders",res);
              gdriveFolders = res;
            }
          })
        } else if($scope.dealCountry === "Italia"){
          itaFolders.forEach(function(f){
            batch.add(setDealFoldersId(f),{id: f.fileId});
          })

          batch.then(function(response){
            if(response.result){

              var res = response.result;
              //console.log("gdriveFolders",res);
              gdriveFolders = res;
            }
          })  
        }
      }
      


      var setDealFoldersId = function(fld){
        return gapi.client.request({
                'path': '/drive/v2/files',
                'method': 'GET',
                'params': {
                    'maxResults': '100',
                    'q': "mimeType = 'application/vnd.google-apps.folder' and '" + fld.fileId + "' in parents",

                 }
        });

        
      }
      

      var ITA_TEMPLATE_FOLDER_ID = "0B55iJQF8ivu0Z2ZGVWtyRUdtQVk"
      var SWI_TEMPLATE_FOLDER_ID = "0Bzz5eDfMkENTRGVsODN3N3QxbXc"

      $scope.copyTemplateFiles = function(containerFolderId, dealTitle)
      {
        
        
        var templateFolderId = $scope.dealCountry === "Svizzera" ? SWI_TEMPLATE_FOLDER_ID : ($scope.dealCountry === "Italia" ? ITA_TEMPLATE_FOLDER_ID : null);


        if(templateFolderId){
          var request = gapi.client.drive.files.get({ 
                                                   'fileId': templateFolderId
                                                 });


          request.then(function(resp){
            //console.log("Resp for Template Folder:",resp.result);
            
            if(resp.result && !resp.result.explicitlyTrashed){
              var file = resp.result;
              $scope.gdriveRoot = { title: file.title,  fileId:  file.id, mimeType: file.mimeType, items: [], destId: containerFolderId }; // '0B55iJQF8ivu0WjlFY0pmLThrWWs'
              console.log("ContainerFolderId",containerFolderId)
              //walkDirectoryAndCopy(file.id,$scope.gdriveRoot,containerFolderId,dealTitle);
              var data = new Object();
              data.title = dealTitle;
              data.parents = [{"id": containerFolderId}];
              data.mimeType = "application/vnd.google-apps.folder";
              gapi.client.drive.files.insert({'resource': data}).execute(
                                                function(result){ 
                                                  if(result.title === $scope.updDealName){
                                                    //console.log("Update Trello Link from gapi insert",result);
                                                    $scope.trelloDescLink1 = "https://drive.google.com/drive/folders/" + result.id + "\n\n";
                                                    $scope.gdrivelink = "https://drive.google.com/drive/folders/" + result.id + "\n";
                                                    
                                                    console.log("Update highrise ==> trello link",$scope.trelloLink);
                                                    updateTrelloLinks();
                                                    updateHRNotes($scope.hrdeal.data.deal.id['$t'],false);
                                                  }

                                                  if(result.code == 403){
                                                    return copyTemplateFiles(containerFolderId,dealTitle);
                                                  }else{
                                                    return $scope.cloneTemplateFiles(templateFolderId,result.id)
                                                  }
                                                });
              

            }
            
          })
        }
        
      }


      var createFolder = function(parentFolderId,title,folderId,parent){
        var data = new Object();
        data.title = title;
        data.parents = [{"id": parentFolderId}];
        data.mimeType = "application/vnd.google-apps.folder";
        gapi.client.drive.files.insert({'resource': data}).execute(
                                          function(result){ 
                                            if(result.title === $scope.updDealName){
                                              //console.log("Update Trello Link from gapi insert",result);
                                              $scope.trelloDescLink1 = "https://drive.google.com/drive/folders/" + result.id + "\n\n";
                                              $scope.gdrivelink = "https://drive.google.com/drive/folders/" + result.id + "\n";
                                              
                                              console.log("Update highrise ==> trello link",$scope.trelloLink);
                                              updateTrelloLinks();
                                              updateHRNotes($scope.hrdeal.data.deal.id['$t'],false);
                                            }

                                            //console.log("Folder Created",result);
                                            if(result.code == 403){
                                              //$timeout(function(){
                                                        return createFolder(parentFolderId,title,folderId,parent);
                                              //        },200);
                                            }else{
                                              //console.log("Folder Created",result);
                                              return walkDirectoryAndCopy(folderId,parent,result.id);
                                            }
                                          });
      }


      $scope.cloneTemplateFiles = function(folderId,destId,folderTitle){
        
        //var defer = $q.defer();
        $timeout(function() {
                              var request = gapi.client.request({
                                    'path': '/drive/v2/files',
                                    'method': 'GET',
                                    'params': {
                                        'maxResults': '100',
                                        'q': "'" + folderId + "' in parents",

                                     }
                                  });

                              return request.then(function(res) {
                                                    var entries = res.result;
                                                    //console.log("entries",entries)
                                                    if(entries.items)
                                                      return $q.all(entries.items.map(function(file) {
                                                                                          //console.log("Create folder",file);
                                                                                          if(file.mimeType === 'application/vnd.google-apps.folder' && !file.explicitlyTrashed) {
                                                                                            var origParent = { title: folderTitle ? folderTitle : file.title,  fileId:  file.id, mimeType: file.mimeType, items: [] };
                                                                                            return $timeout(function(){ cloneFolder(destId,file.title,file.id,origParent); },200);
                                                                                          }else if(!file.explicitlyTrashed){
                                                                                            console.log("Copy ", file.title)
                                                                                            var body =  {
                                                                                                          'title': file.title,
                                                                                                          'parents' : [ { "id" : destId } ]
                                                                                                          
                                                                                                        };
                                                                                            var request = gapi.client.drive.files.copy({
                                                                                              'fileId': file.id,
                                                                                              'resource': body
                                                                                            });
                                                                                            
                                                                                            return request.execute(function(resp) {
                                                                                              if(resp.code == 403)
                                                                                              {
                                                                                                console.log("Problem copy ", file.title)
                                                                                                request.execute(function(newresp) {
                                                                                                  console.log("Retry",newresp);
                                                                                                });
                                                                                              } else {
                                                                                                if(resp.title === "Preventivo e Ordine 2.0")
                                                                                                {
                                                                                                  $scope.trelloDescLink2 = "https://docs.google.com/spreadsheets/d/" + resp.id + "/edit\n\n";
                                                                                                  $scope.gsheetlink = "https://docs.google.com/spreadsheets/d/" + resp.id + "/edit\n";
                                                                                                  
                                                                                                  console.log("Trello link",$scope.trelloLink);

                                                                                                  //console.log("Update Trello Link from file copy");
                                                                                                  updateTrelloLinks();
                                                                                                  updateHRNotes($scope.hrdeal.data.deal.id['$t'],true);
                                                                                                  
                                                                                                }
                                                                                              }






                                                                                            });
                                                                                          }
                                                                                          
                                                                                      }));

                                                  });
                                }, 200);
      }


      var cloneFolder = function( parentFolderId,title,folderId,parent){
        


        var data = new Object();
        data.title = title;
        data.parents = [{"id": parentFolderId}];
        data.mimeType = "application/vnd.google-apps.folder";
        $timeout(function(){
                  gapi.client.drive.files.insert({'resource': data}).execute(
                                                    function(result){ 
                                                      

                                                      //console.log("Folder Created",result);
                                                      if(result.code == 403){
                                                          console.log("Errort 403",result);
                                                          return cloneFolder(parentFolderId,title,folderId,parent);
                                                      }else{
                                                        //console.log("cloneTemplateFiles")
                                                        return $scope.cloneTemplateFiles(folderId,result.id);
                                                      }
                                                    });
                },200);
      }







      
      function walkDirectoryAndCopy(folderId,parent,destId,folderTitle) {

        var defer = $q.defer();

        var request = gapi.client.request({
              'path': '/drive/v2/files',
              'method': 'GET',
              'params': {
                  'maxResults': '100',
                  'q': "'" + folderId + "' in parents",

               }
            });

        return request.then(function(res) {
                              var entries = res.result;
                              console.log("res",res)

                              
                              if(entries.items)
                                return $q.all(entries.items.map(function(file) {
                                          
                                            //console.log(file.title + " - " + file.mimeType)
                                            if(file.mimeType === 'application/vnd.google-apps.folder' && !file.explicitlyTrashed) {
                                                $timeout(function(){
                                                  var origParent = { title: file.title,  fileId:  file.id, mimeType: file.mimeType, items: [] };

                                                  parent.items.push(origParent);
                                                  
                                                  return createFolder(destId,folderTitle ? folderTitle : file.title,file.id,origParent);

                                                },200);
                                               
                                            } else if(!file.explicitlyTrashed){
                                                $timeout(function(){
                                                  //console.log("Copy file in parent:",file.title,parent);
                                                  parent.items.push({ title: file.title,  fileId:  file.id, mimeType: file.mimeType }); 

                                                  var body =  {
                                                                'title': file.title,
                                                                'parents' : [ { "id" : destId } ]
                                                                
                                                              };
                                                  var request = gapi.client.drive.files.copy({
                                                    'fileId': file.id,
                                                    'resource': body
                                                  });
                                                  
                                                  request.execute(function(resp) {
                                                    if(resp.code == 403){
                                                      request.execute(function(newresp) {
                                                        console.log("Retry",newresp);
                                                      });
                                                    }else{
                                                      //console.log('Copy ID: ' , resp);
                                                      if(resp.title === "Preventivo e Ordine 2.0")
                                                      {
                                                        $scope.trelloDescLink2 = "https://docs.google.com/spreadsheets/d/" + resp.id + "/edit\n\n";
                                                        $scope.gsheetlink = "https://docs.google.com/spreadsheets/d/" + resp.id + "/edit\n";
                                                        
                                                        console.log("Trello link",$scope.trelloLink);

                                                        //console.log("Update Trello Link from file copy");
                                                        updateTrelloLinks();
                                                        updateHRNotes($scope.hrdeal.data.deal.id['$t'],true);
                                                        
                                                      }
                                                      // update trello card with link
                                                    }
                                                    //return null;  // Don't wait for anything
                                                  });
                                                },200);
                                              }
                                          
                                        }));
                                    

                            });
                            
      };



      /////////////////////////////////////////////////////////////////////////////////////////
      //                        Trello Section                                               //
      /////////////////////////////////////////////////////////////////////////////////////////
      

      var tettiBoardId = "BNBe9zmb";
      var tettiListPreventiviDaFareId = "55881caf1a5446f4de06a101";
      var tettiTemplateCardId = "56054cdee8dfe86066e5f9d7";

      var caseBoardId = "Ud8I2OJ0";
      var caseListPreventiviDaFareId = "55a5060a8e660ea86ae09bf2";
      var caseTemplateCardId = "560a80e753f6d2a58131810e";

      var outdooorBoardId = "iDrCmTUi";
      var outdooorListPreventiviDaFareId = "566944e6308c21d95df15f2c";
      var outdooorTemplateCardId = "55b1ed7f76834b6aa0787ddc";

      var floorBoardId = "DT5l3jTm";
      var floorListPreventiviDaFareId = "566961e75c22b545f24f8a01";
      var floorTemplateCardId = "566978a21924a87c9c420baf";

      //var listEmptyCardId = "55881caf1a5446f4de06a100";
      var listPreventiviDaFareId = tettiListPreventiviDaFareId; 
      var templateCardId = tettiBoardId;

        
      
      // ITA Boards
      var itaTettiBoardId = "FZ7ojMAv";
      var itaTettiListPreventiviDaFareId = "52f3787566d34a102141fba0";
      var itaTettiTemplateCardId = "B4tYbcSJ";

      var itaCaseBoardId = "sfmw6bWf";
      var itaCaseListPreventiviDaFareId = "565f1c15aefe2e1ea3e322b3";
      var itaCaseTemplateCardId = "brpgu6py";

      var itaOutdooorBoardId = "ubYTqRNo";
      var itaOutdooorListPreventiviDaFareId = "54ad1493f2846888caafe1e9";
      var itaOutdooorTemplateCardId = "I6J4CzJ8";

      var itaFloorBoardId = "pDgBnQlt";
      var itaFloorListPreventiviDaFareId = "56b8a64520a6da342e99ad27";
      var itaFloorTemplateCardId = "D6opQIoi";



      //var listEmptyCardId = "55881caf1a5446f4de06a100";
      var listPreventiviDaFareId = $scope.dealCountry === "Svizzera" ?  tettiListPreventiviDaFareId : ($scope.dealCountry === "Italia" ? itaTettiListPreventiviDaFareId : null);  
      var templateCardId = $scope.dealCountry === "Svizzera" ?  tettiTemplateCardId : ($scope.dealCountry === "Italia" ? itaTettiTemplateCardId : null); 


      $scope.trelloDescRowsBottom  = "**Contratti, Fatturazione e Pagamenti Clienti**\n" +
                                     "Link!\n\n" +
                                     "**Link a Fornitori**\n" +
                                     "Link!";


      var getTrelloListId = function(cardCategory){
        if($scope.dealCountry === "Italia"){
          
          var oldTrelloList = itaTettiListPreventiviDaFareId;
          if(cardCategory === "COSTRUZIONI - in progetto" ||
             cardCategory === "COSTRUZIONI - lavoro avviato" ||
             cardCategory === "COSTRUZIONI - studio fattibilità" ||
             cardCategory === "TERRENI")
          {
            oldTrelloList = itaCaseListPreventiviDaFareId;
          
          } else if(cardCategory === "TETTI")
          {
            oldTrelloList = itaTettiListPreventiviDaFareId;
          }
          else if(cardCategory === "G50 - in progetto" ||
                  cardCategory === "G50 - lavoro avviato" ||
                  cardCategory === "GBLINDS - in progetto" ||
                  cardCategory === "GBLINDS - lavoro avviato" ||
                  cardCategory === "GFASSADEN - in progetto" ||
                  cardCategory === "GFASSADEN - lavoro avviato" ||
                  cardCategory === "GSUNSCREEN - in progetto" ||
                  cardCategory === "GSUNSCREEN - lavoro avviato")
          {

            oldTrelloList = itaOutdooorListPreventiviDaFareId;

          } else if($scope.hrdeal.data.deal.category.name === "PARQUET")
            oldTrelloList = itaFloorListPreventiviDaFareId;  

           return oldTrelloList;

        } else if($scope.dealCountry === "Svizzera"){
          var oldTrelloList = tettiListPreventiviDaFareId;
          if(cardCategory === "COSTRUZIONI")
            oldTrelloList = caseListPreventiviDaFareId;
          else if(cardCategory === "TETTI")
            oldTrelloList = tettiListPreventiviDaFareId;
          else if(cardCategory === "OUTDOOR")
            oldTrelloList = outdooorListPreventiviDaFareId;
          else if($scope.hrdeal.data.deal.category.name === "PARQUET")
            oldTrelloList = floorListPreventiviDaFareId;  

          return oldTrelloList;
        }
      }

      var getTemplateCardId = function(listId){
        switch(listId){
          //SWI
          case tettiListPreventiviDaFareId:
            return tettiTemplateCardId;
          case caseListPreventiviDaFareId:
            return caseTemplateCardId;
          case outdooorListPreventiviDaFareId:
            return outdooorTemplateCardId;
          case floorListPreventiviDaFareId:
            return floorTemplateCardId;

          // ITA
          case itaTettiListPreventiviDaFareId:
            return itaTettiTemplateCardId;
          case itaCaseListPreventiviDaFareId:
            return itaCaseTemplateCardId;
          case itaOutdooorListPreventiviDaFareId:
            return itaOutdooorTemplateCardId;
          case itaFloorListPreventiviDaFareId:
            return itaFloorTemplateCardId;
        }
      }



      
      var upsertTrelloCard = function(dealId, dealUrl,cardTitle,customer,oldCardCategory){
        
        console.log("upsertTrelloCard",dealId, dealUrl,cardTitle,customer,oldCardCategory)

        
        var oldTrelloList = getTrelloListId(oldCardCategory)


        
        if(!$scope.hrdeal.data.deal.category){
          console.log("Generate Trello Card")
          generateTrelloCard(dealId, dealUrl,cardTitle,customer);
        }
        
        else if(oldCardCategory && oldCardCategory !== $scope.hrdeal.data.deal.category.name){
          console.log("Old Category changed");
          //console.log("Remove card from old list",oldTrelloList);
          // delete card if exists
          Trello.get("/lists/" + oldTrelloList + "/cards") 
                .then(function(cardList){
                  console.log("Card List",cardList)
                  if(cardList && cardList.length)
                    for(var i=0; i < cardList.length; i++){
                      if(cardList[i].name.indexOf(dealId) != -1){
                        return cardList[i];
                      }
                    }
                  
                  return null;
                })
                .then(function(card){ 
                  if(card){
                    
                    Trello.delete("/cards/" + card.id)   
                          .then(function(result){
                            //console.log("Card Desc",card)
                            generateTrelloCard(dealId, dealUrl,cardTitle,customer,card.desc);
                          })
                  }else{
                    //console.log("Create new Trello Card");
                    generateTrelloCard(dealId, dealUrl,cardTitle,customer);
                  }
                });
        }else { // update card
          console.log("Update card",$scope.hrdeal.data.deal.category)
          
          Trello.get("/lists/" + oldTrelloList + "/cards") 
                .then(function(cardList){
                  if(cardList && cardList.length)
                    for(var i=0; i < cardList.length; i++){
                      if(cardList[i].name.indexOf(dealId) != -1){
                        return cardList[i];
                      }
                    }
                  
                  return null;

                  
                })
                .then(function(card){ 
                  if(card){
                    //console.log("Card exists",card)
                    generateTrelloCard(dealId, dealUrl,cardTitle,customer,card.desc);
                  }else{
                    generateTrelloCard(dealId, dealUrl,cardTitle,customer);
                  }
                });
            
        } // end update card
      } // end upsertTrelloCard


      var generateTrelloCard = function(dealId, dealUrl,cardTitle,customer,cardDesc){
          listPreventiviDaFareId = getTrelloListId($scope.hrdeal.data.deal.category.name)
          templateCardId = getTemplateCardId(listPreventiviDaFareId);
          console.log("listPreventiviDaFareId",listPreventiviDaFareId,templateCardId);

          $scope.trelloDescRow1  = "**Cartella Ordine Vendita**\n";
          $scope.trelloDescLink1 = "Link!\n\n";

          $scope.trelloDescRow2  = "**Calcolo Preventivo e Contratto**\n";
          $scope.trelloDescLink2 = "Link!\n\n";

          $scope.trelloDescRow3  = "**Deal Highrise**\n";

          var url = dealUrl;
          if(dealUrl.indexOf("/edit") != -1){
            url = url.substring(0,dealUrl.indexOf("/edit"));
          }


          $scope.trelloDescLink3 = url + "\n\n";



          Trello.get("/lists/" + listPreventiviDaFareId + "/cards") 
            .then(function(cardList){
              if(cardList && cardList.length)
                for(var i=0; i < cardList.length; i++){
                  if(cardList[i].name.indexOf(dealId) != -1){
                    return cardList[i];
                  }
                }
              return null;
            })
            .then(function(card){
              var desc = cardDesc;
              if(!cardDesc)
                desc =    $scope.trelloDescRow1 +
                          $scope.trelloDescLink1 +
                          $scope.trelloDescRow2 +
                          $scope.trelloDescLink2 + 
                          $scope.trelloDescRow3  +
                          $scope.trelloDescLink3 +
                          $scope.trelloDescRowsBottom;


              if(card){
                console.log("Card exists",card);
                $scope.trelloLink = card.url;
                $scope.shortTrelloLink = card.shortUrl;


                var token = $scope.dealCountry === "Svizzera" ?  $scope.hrtokenSwi : ($scope.dealCountry === "Italia" ? $scope.hrtokenIta : null);
                var url   = $scope.dealCountry === "Svizzera" ?  swiHighriseUrl : ($scope.dealCountry === "Italia" ? itaHighriseUrl : null);


                if(token && url){
                  console.log("Update note",token,url)
                  HighRiseNotes.get({dealurl: url + "/" + dealId + "/notes", token: token},
                                               function(notes){
                                                  console.log("Notes",notes)
                                                  /*if(notes.data.notes && notes.data.notes.note){
                                                    $scope.hrnote = notes.data.notes.note.body;

                                                    var customFields = $scope.hrnote.split("\n");

                                                    //$scope.constructionSitePlaceId = customFields[0] && customFields[0].indexOf("CantierePlaceId: ") != -1 ? customFields[0].substring("CantierePlaceId: ".length,customFields[0].length) : null;
                                                    //$scope.constructionSite = customFields[1] && customFields[1].indexOf("Cantiere: ") != -1 ? customFields[1].substring("Cantiere: ".length,customFields[1].length) : null;
                                                    //$scope.jobDescription = customFields[2] && customFields[2].indexOf("Descrizione: ") != -1 ? customFields[2].substring("Descrizione: ".length,customFields[2].length) : null;
                                                    $scope.gdrivelink = customFields[3] && customFields[3].indexOf("Link GDrive: ") != -1 ? customFields[3].substring("Link GDrive: ".length,customFields[3].length) : null;
                                                    $scope.gsheetlink = customFields[4] && customFields[4].indexOf("Link Gsheet: ") != -1 ? customFields[4].substring("Link Gsheet: ".length,customFields[4].length) : null;
                                                    //$scope.trelloLink = customFields[5] && customFields[5].indexOf("Link Trello: ") != -1 ? customFields[5].substring("Link Trello: ".length,customFields[5].length) : null;

                                                    //console.log("Upd trello card",$scope.gsheetlink)
                                                  }*/
                                                  updateHRNotes(dealId,false); // update highrise note and open deal in highrise
                                                  checkGDriveFolders(customer,dealId,$scope.updDealName);

                                                });

                }
              }
              else{
                console.log("Card not exists");
                // Template Card
                Trello.get("/cards/" + templateCardId)
                  .then(function(tcard){
                    if(tcard){
                       var newCard = {
                          name: cardTitle,
                          idCardSource: tcard.id,
                          due: "",
                          idList: listPreventiviDaFareId, 
                          pos: "bottom",
                          desc: desc

                        };

                        //console.log("Create new card",newCard);

                       Trello.post("/cards",newCard,function(result){
                        console.log("Card Created Successfully - now update Highrise",result);
                        $scope.trelloLink = result.url;
                        $scope.shortTrelloLink = result.shortUrl;

                        var token     = $scope.dealCountry === "Svizzera" ?  $scope.hrtokenSwi : ($scope.dealCountry === "Italia" ? $scope.hrtokenIta : null);
                        var url       = $scope.dealCountry === "Svizzera" ?  swiHighriseUrl : ($scope.dealCountry === "Italia" ? itaHighriseUrl : null);
                        var country   = $scope.dealCountry === "Svizzera" ?  "SWI" : ($scope.dealCountry === "Italia" ? "ITA" : null);


                        if(token && url && country)
                          HighRiseNotes.get({dealurl: url + "/" + dealId + "/notes", token: token},
                                                       function(notes){
                                                          console.log("Notes",notes)
                                                          if(notes.data.notes && notes.data.notes.note){
                                                            $scope.hrnote = notes.data.notes.note.body;

                                                            var customFields = $scope.hrnote.split("\n");
                                                            if(customFields.length){
                                                                for(var i=0; i < customFields.length; i++){
                                                                  if(customFields[i].length && customFields[i].indexOf("Link GDrive: ") != -1)
                                                                    $scope.gdrivelink = customFields[i].substring("Link GDrive: ".length,customFields[i].length);
                                                                  else if(customFields[i].length && customFields[i].indexOf("Link Gsheet: ") != -1)
                                                                    $scope.gsheetlink = customFields[i].substring("Link Gsheet: ".length,customFields[i].length);
                                                                  
                                                                }
                                                            }


                                                            //$scope.gdrivelink = customFields[3] && customFields[3].indexOf("Link GDrive: ") != -1 ? customFields[3].substring("Link GDrive: ".length,customFields[3].length) : null;
                                                            //$scope.gsheetlink = customFields[4] && customFields[4].indexOf("Link Gsheet: ") != -1 ? customFields[4].substring("Link Gsheet: ".length,customFields[4].length) : null;

                                                            // Update HighriseNotes
                                                            updateHRNotes(dealId,false)
                                                            
                                                            // verifica le cartelle in GDrive
                                                            checkGDriveFolders(customer,dealId,$scope.updDealName);
                                                          }else{

                                                            console.log("Create note",$scope.trelloLink)

                                                            var bodyText = "CantierePlaceId: "  + $scope.constructionSitePlaceId + "\n" +
                                                                           "Cantiere: "         + $scope.constructionSite + "\n" + 
                                                                           "Descrizione: "      + $scope.jobDescription + "\n" +
                                                                           "Link GDrive: "      + $scope.gdrivelink +  "\n" +
                                                                           "Link Gsheet: "      + $scope.gsheetlink +  "\n" +
                                                                           "Link Trello: "      + $scope.trelloLink;

                                                            var note = new HighRiseNotes({ dealurl: url + "/" + dealId + "/notes", 
                                                                                           body: bodyText, 
                                                                                           id: dealId,
                                                                                           token: token,
                                                                                           country: country});

                                                            note.$save(function(savedNotes){
                                                              console.log("Saved Notes",savedNotes);
                                                              // Update HighriseNotes
                                                              updateHRNotes(dealId,false)
                                                            
                                                              // verifica le cartelle in GDrive
                                                              checkGDriveFolders(customer,dealId,$scope.updDealName);
                                                            })
                                                          }
                                                        });

                        
                       })
                    }

                    return tcard;
                })
              } // end create new card
              
          });

      }



      var updateTrelloLinks = function(){

         



        if($scope.hrdeal){

          var dealId = $scope.hrdeal.data.deal.id['$t'];

          listPreventiviDaFareId = getTrelloListId($scope.hrdeal.data.deal.category.name);
         
          Trello.get("/lists/" + listPreventiviDaFareId + "/cards") 
                            .then(function(cardList){
                              //console.log("CardList preventivi da fare",cardList)
                              if(cardList && cardList.length)
                                for(var i=0; i < cardList.length; i++){
                                  if(cardList[i].name.indexOf(dealId) != -1){
                                    return cardList[i];
                                  }
                                }
                              
                              return null;

                              
                            })
                            .then(function(card){
                              var desc =  $scope.trelloDescRow1 +
                                          $scope.trelloDescLink1 +
                                          $scope.trelloDescRow2 +
                                          $scope.trelloDescLink2 + 
                                          $scope.trelloDescRow3  +
                                          $scope.trelloDescLink3 +
                                          $scope.trelloDescRowsBottom;

                              if(card){
                                //console.log("Card Desc",desc)
                                Trello.put("/cards/" + card.id, {desc: desc},function(response){
                                    //console.log("Update with new links",response);
                                  });

                              }


                            });
          }
          else
            console.log("Undefined hrdeal");
      }


      $scope.goMainGa = function(){
        $state.go("mainga");
      }

      $scope.storeSwissHighriseToken = function(){
        $rootScope.tokenSwi = localStorageService.get('hrtokenSwi');
        
        $scope.modalInstance = $modal.open({
                templateUrl: 'components/modal/authorize-swi-highrise-modal.html',
                scope: $scope,
                size: 'md'
          }); 
      }

      $scope.storeItaHighriseToken = function(){
        $rootScope.tokenIta = localStorageService.get('hrtokenIta');
        
        $scope.modalInstance = $modal.open({
                templateUrl: 'components/modal/authorize-ita-highrise-modal.html',
                scope: $scope,
                size: 'md'
          }); 
      }

      $scope.saveHighriseTokens = function(country){
          //console.log("Save country token ",country)
          if(country === 'ITA')  
            localStorageService.set('hrtokenIta', this.tokenIta);
          else if(country === 'SWI')  
            localStorageService.set('hrtokenSwi', this.tokenSwi);

          if($scope.modalInstance)
            $scope.modalInstance.dismiss();
      }

      var authenticationSuccess = function() { 
                                  Trello.get("/tokens/" + Trello.token() + "/member/fullName",function(res){
                                      $rootScope.trelloToken = Trello.token();
                                      $rootScope.trelloFullName = res._value;  
                                      $scope.$digest();                                    
                                  })
                                }; 

      var authenticationFailure = function() { console.log("Failed authentication"); };

      $rootScope.authorizeTrello = function(){
        //console.log("authorize trello")
        Trello.authorize({
          type: "popup",
          name: "Automazione CRM - Galimberti",
          scope: {
            read: true,
            write: true 
          },
          expiration: "never",
          success:  authenticationSuccess,
          error:    authenticationFailure
        });
      }
      $rootScope.authorizeTrello();

      
      $scope.logoutTrello = function(){ 
        Trello.deauthorize();
        location.reload();
      }


      $scope.setPositionMarker = function(){
        if($scope.constructionSitePlaceId){
          var geocoder = new google.maps.Geocoder;
          geocoder.geocode({'placeId': $scope.constructionSitePlaceId}, function(results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
              if(results[0]){
                
                if(results[0].address_components && results[0].address_components[1])
                  $scope.cityName = results[0].address_components[1].short_name;

                if(results[0].geometry.viewport) {
                  map.fitBounds(results[0].geometry.viewport);
                } else {
                  map.setZoom(17);
                  map.setCenter(results[0].geometry.location);
                  
                } 

                marker.setPosition(results[0].geometry.location);
                marker.setVisible(true);

                infowindow.setContent($scope.constructionSite);
                infowindow.open(map, marker);
              }
            } else {
              console.log('Geocoder failed due to: ' , status);
            }
          });
        }
      }


      $scope.redirectToHighriseDeal = function(){
        if($scope.hrdeal && $scope.hrdeal.data.deal.id['$t']){
          var hrUrl;
          if($scope.dealCountry === "Italia")
            hrUrl = itaHighriseUrl;
          else if($scope.dealCountry === "Svizzera")
            hrUrl = swiHighriseUrl;
          

          if(hrUrl)
            $window.open(hrUrl + '/' + $scope.hrdeal.data.deal.id['$t'], '_blank');
        }
      };

      $scope.redirectToTrelloCard = function(){
        var token = $scope.dealCountry === "Svizzera" ?  $scope.hrtokenSwi : ($scope.dealCountry === "Italia" ? $scope.hrtokenIta : null);
        var url = $scope.dealCountry === "Svizzera" ?  swiHighriseUrl : ($scope.dealCountry === "Italia" ? itaHighriseUrl : null);


        if($scope.hrdeal && $scope.hrdeal.data.deal.id['$t'] && token && url)
          HighRiseNotes.get({dealurl: url + "/" + $scope.hrdeal.data.deal.id['$t'] + "/notes", token: token},
                                       function(notes){
                                          //console.log("Notes",notes)
                                          if(notes.data.notes && notes.data.notes.note && notes.data.notes.note.body)
                                            $scope.hrnote = notes.data.notes.note.body;
                                          else if(notes.data.notes && notes.data.notes.note && notes.data.notes.note.length)
                                            $scope.hrnote = notes.data.notes.note[0].body;


                                          if($scope.hrnote)
                                          {
                                            var customFields = $scope.hrnote.split("\n");
                                            if(customFields.length){
                                              for(var i=0; i < customFields.length; i++){
                                                if(customFields[i].length && customFields[i].indexOf("Link Trello: ") != -1)
                                                  $scope.trelloLink = customFields[i].substring("Link Trello: ".length,customFields[i].length)
                                              }
                                            }

                                            if($scope.trelloLink)
                                              $window.open($scope.trelloLink, '_blank');
                                          }
                                        });


        
      };
      
      $scope.redirectClient3Importa = function(){
        var token = $scope.dealCountry === "Svizzera" ?  $scope.hrtokenSwi : ($scope.dealCountry === "Italia" ? $scope.hrtokenIta : null);
        var url = $scope.dealCountry === "Svizzera" ?  swiHighriseUrl : ($scope.dealCountry === "Italia" ? itaHighriseUrl : null);


        if($scope.hrdeal && $scope.hrdeal.data.deal.id['$t'] && token && url){
          HighRiseNotes.get({dealurl: url + "/" + $scope.hrdeal.data.deal.id['$t'] + "/notes", token: token},
                                       function(notes){
                                          //console.log("Notes",notes)
                                          if(notes.data.notes && notes.data.notes.note){
                                            $scope.hrnote = notes.data.notes.note.body;

                                            var customFields = $scope.hrnote.split("\n");
                                            if(customFields.length){
                                              for(var i=0; i < customFields.length; i++){
                                                if(customFields[i].length && customFields[i].indexOf("Link Trello: ") != -1)
                                                  $scope.trelloLink = customFields[i].substring("Link Trello: ".length,customFields[i].length)
                                              }
                                            }

                                            if($scope.trelloLink){
                                              var trelloLnk = $scope.trelloLink.substring("https://trello.com/c/".length,$scope.trelloLink.length);
                                              if(trelloLnk && trelloLnk.indexOf("/") != -1){
                                                var idx = trelloLnk.indexOf("/") ;
                                                var cardId = trelloLnk.substring(0,idx);
                                                if(cardId){
                                                  var trelloSearch = "https$2F$2Ftrello.com$2Fc$2F"  + cardId;
                                                  $window.open('https://groups.google.com/a/galimberti.eu/forum/#!searchin/clienti3importa/' + trelloSearch, '_blank');
                                                }
                                              }
                                            }
                                          }
                                        });


          
        }
      };

      $scope.composeNewMail = function(){
        var token = $scope.dealCountry === "Svizzera" ?  $scope.hrtokenSwi : ($scope.dealCountry === "Italia" ? $scope.hrtokenIta : null);
        var url = $scope.dealCountry === "Svizzera" ?  swiHighriseUrl : ($scope.dealCountry === "Italia" ? itaHighriseUrl : null);


       console.log("sign",currentProfile)


       
      HighRiseNotes.get({dealurl: url + "/" + $scope.hrdeal.data.deal.id['$t'] + "/notes", token: token},
                                       function(notes){
                                          //console.log("Notes",notes);
                                          if(notes.data.notes && notes.data.notes.note){
                                            $scope.hrnote = notes.data.notes.note.body;

                                            var customFields = $scope.hrnote.split("\n");
                                            if(customFields.length){
                                              for(var i=0; i < customFields.length; i++){
                                                if(customFields[i].length && customFields[i].indexOf("CantierePlaceId: ") != -1)
                                                  $scope.constructionSitePlaceId = customFields[i].substring("CantierePlaceId: ".length,customFields[i].length);
                                                else if(customFields[i].length && customFields[i].indexOf("Cantiere: ") != -1)
                                                  $scope.constructionSite = customFields[i].substring("Cantiere: ".length,customFields[i].length);
                                                else if(customFields[i].length && customFields[i].indexOf("Descrizione: ") != -1)
                                                  $scope.jobDescription = customFields[i].substring("Descrizione: ".length,customFields[i].length);
                                                else if(customFields[i].length && customFields[i].indexOf("Link GDrive: ") != -1)
                                                  $scope.gdrivelink = customFields[i].substring("Link GDrive: ".length,customFields[i].length);
                                                else if(customFields[i].length && customFields[i].indexOf("Link Gsheet: ") != -1)
                                                  $scope.gsheetlink = customFields[i].substring("Link Gsheet: ".length,customFields[i].length);
                                                else if(customFields[i].length && customFields[i].indexOf("Link Trello: ") != -1)
                                                  $scope.trelloLink = customFields[i].substring("Link Trello: ".length,customFields[i].length)
                                              }
                                            }



                                            
                                            if($scope.trelloLink){
                                              var trelloLnk = $scope.trelloLink.substring("https://trello.com/c/".length,$scope.trelloLink.length);
                                              if(trelloLnk && trelloLnk.indexOf("/") != -1){
                                                var idx = trelloLnk.indexOf("/") ;
                                                var cardId = trelloLnk.substring(0,idx);
                                                if(cardId){
                                                  $scope.shortTrelloLink = "https://trello.com/c/" + cardId;
                                                  var tlink = "%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A" + $scope.shortTrelloLink
                                                  //$window.open("https://mail.google.com/mail/u/0/?view=cm&fs=1&tf=1&su=" + $scope.jobDescription + "&body=" + tlink + "&shva=1", '_blank');
                                                  $window.open("https://mail.google.com/mail/?ui=2&view=cm&fs=1&tf=1&shva=1&su=" + $scope.jobDescription + "%20-%20" + tlink + "&compose=new",'Compose%20Gmail','status=no,directories=no,location=no,resizable=no,menubar=no,width=600,height=600,toolbar=no,signature=yes');
                                                }
                                              }


                                              

                                             

                                            }
                                          }
                                        });
      }


  });
