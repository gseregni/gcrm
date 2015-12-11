'use strict';

angular.module('galimbertiCrmApp')
  .controller('MainCtrl', function ($rootScope, $scope, $http, $q, $timeout,$interval, localStorageService, 
                                    HighRiseDeal,
                                    HighRisePeople,
                                    HighRiseDealCategory,
                                    HighRiseNotes) {
	   


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


		

          


  		$scope.getHighRiseDeal = function(){
        
  			$scope.hrtokenIta =  localStorageService.get("hrtokenIta");   
  			$scope.hrtokenSwi  = localStorageService.get("hrtokenSwi");  
  			$scope.hrdeal = null;
  			$scope.hrValidationMsg = null;

        // Authorize Trello
        $rootScope.authorizeTrello();




  			if(!$scope.dealurl || ($scope.dealurl.indexOf(swiHighriseUrl) == -1 && $scope.dealurl.indexOf(itaHighriseUrl) == -1)){
  				$scope.hrValidationMsg = "Il link inserito non è un deal valido";
  			}
  			else if(!$scope.hrtokenIta && $scope.dealurl.indexOf(itaHighriseUrl) != -1)
  				$scope.hrValidationMsg = "Non hai inserito il token Highrise per la società italiana";
  			else if(!$scope.hrtokenSwi && $scope.dealurl.indexOf(swiHighriseUrl) != -1)
  				$scope.hrValidationMsg = "Non hai inserito il token Highrise per la società svizzera";
  			// valid path
  			else if($scope.dealurl.indexOf(swiHighriseUrl) != -1){
          var dealurl = $scope.dealurl

          // init highrise note
          $scope.hrnote = null;
          // init gdrive link
          $scope.gdrivelink = null;
          $scope.gdriveOrderLink = null;

  				if(dealurl.indexOf("/edit") != -1)
            dealurl = dealurl.substring(0,dealurl.indexOf("/edit"));

          HighRiseDeal.get({dealurl: dealurl, token: $scope.hrtokenSwi},function(deal){
            $scope.hrdeal = deal;
            HighRisePeople.get({country: 'SWI', token: $scope.hrtokenSwi},function(people){
              $scope.managerOptions = [];
              if(people.users && people.users.user && people.users.user.length){
                var users = people.users.user;
                users.forEach(function(d){
                  $scope.managerOptions.push({id: d.id['$t'] , label: d.name}) ;
                });
                $scope.managerModel.id = deal.data.deal['responsible-party-id']['$t'];
              }

              HighRiseDealCategory.get({country: 'SWI' , dealurl: dealurl, token: $scope.hrtokenSwi},function(cats){
                //console.log("Categories",cats);

                $scope.jobTypeOptions = [];
                if(cats['deal-categories'] && cats['deal-categories']['deal-category'] && cats['deal-categories']['deal-category'].length){
                  var categories = cats['deal-categories']['deal-category'];
                  categories.forEach(function(d){
                    $scope.jobTypeOptions.push({id: d.id['$t'] , label: d.name}) ;
                  });
                  $scope.jobTypeModel.id = deal.data.deal['category-id']['$t'];
                }

              });

              //console.log("hrdeals",$scope.hrdeal);

              if($scope.hrdeal.data){
                var dealId = $scope.hrdeal.data.deal.id['$t']
                HighRiseNotes.get({dealurl: swiHighriseUrl + "/" + dealId + "/notes", token: $scope.hrtokenSwi},
                                   function(notes){
                                      if(notes.data.notes && notes.data.notes.note)
                                        $scope.hrnote = notes.data.notes.note.body;

                                        var baseTrelloLink = "https://trello.com/c/";
                                        if($scope.hrnote && $scope.hrnote.length >= baseTrelloLink.length + 8){
                                          var cardId = $scope.hrnote.substring(baseTrelloLink.length,baseTrelloLink.length + 8)
                                          
                                          if(cardId)
                                            // get grive folder from Trello
                                            Trello.get("/cards/" + cardId)
                                                  .then(function(card){
                                                    //console.log("Card ", card);
                                                    if(card.desc){
                                                      var ordineVendita = "**Cartella Ordine Vendita**";
                                                      var idxOrdineVendita = card.desc.indexOf(ordineVendita);

                                                      var calcoloPreventivo = "**Calcolo Preventivo e Contratto**"
                                                      var idxCalcoloPreventivo = card.desc.indexOf(calcoloPreventivo);

                                                      var dealHighrise = "**Deal Highrise**"
                                                      var idxDealHighrise = card.desc.indexOf(dealHighrise);


                                                      
                                                      if(idxOrdineVendita != -1 && idxCalcoloPreventivo != -1)
                                                        $scope.gdrivelink = card.desc.substring(ordineVendita.length,idxCalcoloPreventivo);

                                                      if(idxCalcoloPreventivo != -1 && idxDealHighrise != -1)
                                                        $scope.gdriveOrderLink = card.desc.substring(idxCalcoloPreventivo + calcoloPreventivo.length,idxDealHighrise);


                                                      $scope.$digest();
                                                    }



                                                  });
                                          
                                        }
                                        



                                   });
              }

              $scope.hrValidationMsg = null;
            })
          });
          
  			}
  			else if($scope.dealurl.indexOf(itaHighriseUrl) != -1){
          var dealurl = $scope.dealurl
          if(dealurl.indexOf("/edit") != -1)
            dealurl = dealurl.substring(0,dealurl.indexOf("/edit"));

  				
          HighRiseDeal.get({dealurl: dealurl, token: $scope.hrtokenSwi},function(deal){
            $scope.hrdeal = deal;
            HighRisePeople.get({country: 'ITA', token: $scope.hrtokenSwi},function(people){
              $scope.managerOptions = [];
              if(people.users && people.users.user && people.users.user.length){
                var users = people.users.user;
                users.forEach(function(d){
                  $scope.managerOptions.push({id: d.id['$t'] , label: d.name}) ;
                });
                $scope.managerModel.id = deal.data.deal['responsible-party-id']['$t'];
              }

              HighRiseDealCategory.get({country: 'ITA' , dealurl: dealurl, token: $scope.hrtokenSwi},function(cats){
                //console.log("Categories",cats);

                $scope.jobTypeOptions = [];
                if(cats['deal-categories'] && cats['deal-categories']['deal-category'] && cats['deal-categories']['deal-category'].length){
                  var categories = cats['deal-categories']['deal-category'];
                  categories.forEach(function(d){
                    $scope.jobTypeOptions.push({id: d.id['$t'] , label: d.name}) ;
                  });
                  $scope.jobTypeModel.id = deal.data.deal['category-id']['$t'];
                }

              });

              //console.log("hrdeals",$scope.hrdeal);

              if($scope.hrdeal.data){
                var dealId = $scope.hrdeal.data.deal.id['$t']
                HighRiseNotes.get({dealurl: itaHighriseUrl + "/" + dealId + "/notes", token: $scope.hrtokenIta},
                                   function(notes){
                                      if(notes.data.notes && notes.data.notes.note)
                                        $scope.hrnote = notes.data.notes.note.body;

                                        var baseTrelloLink = "https://trello.com/c/";
                                        if($scope.hrnote && $scope.hrnote.length >= baseTrelloLink.length + 8){
                                          var cardId = $scope.hrnote.substring(baseTrelloLink.length,baseTrelloLink.length + 8)
                                          
                                          if(cardId)
                                            // get grive folder from Trello
                                            Trello.get("/cards/" + cardId)
                                                  .then(function(card){
                                                    //console.log("Card ", card);
                                                    if(card.desc){
                                                      var ordineVendita = "**Cartella Ordine Vendita**";
                                                      var idxOrdineVendita = card.desc.indexOf(ordineVendita);

                                                      var calcoloPreventivo = "**Calcolo Preventivo e Contratto**"
                                                      var idxCalcoloPreventivo = card.desc.indexOf(calcoloPreventivo);

                                                      var dealHighrise = "**Deal Highrise**"
                                                      var idxDealHighrise = card.desc.indexOf(dealHighrise);
                                                      
                                                      if(idxOrdineVendita != -1 && idxCalcoloPreventivo != -1)
                                                        $scope.gdrivelink = card.desc.substring(ordineVendita.length,idxCalcoloPreventivo);

                                                      if(idxCalcoloPreventivo != -1 && idxDealHighrise != -1)
                                                        $scope.gdriveOrderLink = card.desc.substring(idxCalcoloPreventivo + calcoloPreventivo.length,idxDealHighrise);

                                                      $scope.$digest();
                                                    }
                                                  });
                                        }
                                   });
              }

              $scope.hrValidationMsg = null;
            })
          });
  			}
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
          
          $scope.updDealName = customer + " - " +
  							   "Cantiere in " + $scope.constructionSite + " - " +
  							   $scope.jobDescription + " - " +
  							   dealId + " - " +
  							   author + " - " +
  							   jobType;

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
          $scope.jobTypeOptions.forEach(function(o){
            if(o.id === $scope.hrdeal.data.deal.category.id['$t'])
              oldJobCategory = o.label;  
          })



  				hrd.$update(function(res){
  					//console.log("Result",res);
  					$scope.hrdeal = res;
            $scope.resultDealName = res.data.deal.name;

            // Upsert Trello
            if(res && res.data.deal && country === "SWI"){
              upsertTrelloCard(res.data.deal.id['$t'], $scope.dealurl, res.data.deal.name,customer,oldJobCategory)
            }

  				})

          

  			}else
  				$scope.hrValidationMsg = "Invalid Link";
  		}


      var updateHRNotes = function(dealId,trelloLink){
        if($scope.dealurl.indexOf(swiHighriseUrl) != -1){
                  HighRiseNotes.get({dealurl: swiHighriseUrl + "/" + dealId + "/notes", token: $scope.hrtokenSwi},
                                    function(result){
                                      //console.log("Notes from Highrise",result.data.notes,result.data.notes.note);

                                      if(!result.data.notes.note){
                                        var note = new HighRiseNotes({ dealurl: swiHighriseUrl + "/" + dealId + "/notes", 
                                                                       body: trelloLink, 
                                                                       id: dealId,
                                                                       token: $scope.hrtokenSwi,
                                                                       country: 'SWI'});
                                        note.$save(function(savedNotes){
                                          console.log("Saved Notes",savedNotes);
                                        })
                                      }else{

                                        HighRiseNotes.update({ dealurl: swiHighriseUrl + "/" + dealId + "/notes" , 
                                                               body: trelloLink, 
                                                               id: result.data.notes.note.id['$t'],
                                                               dealId: dealId,
                                                               token: $scope.hrtokenSwi,
                                                               country: 'SWI'
                                                            },
                                        function(updatedNote){
                                          console.log("Note Updated",updatedNote);
                                        })
                                      }



                                    });
        }
        else if($scope.dealurl.indexOf(itaHighriseUrl) != -1){
            HighRiseNotes.get({dealurl: itaHighriseUrl + "/" + dealId + "/notes", token: $scope.hrtokenIta},
                               function(result){
                                //console.log("Notes from Highrise",result.data.notes,result.data.notes.note);

                                if(!result.data.notes.note){
                                  var note = new HighRiseNotes({dealurl: itaHighriseUrl + "/" + dealId + "/notes", 
                                                                body: trelloLink, 
                                                                id: dealId,
                                                                token: $scope.hrtokenIta,
                                                                country: 'ITA'
                                                              });
                                  note.$save(function(savedNotes){
                                          console.log("Saved Notes",savedNotes);
                                        })
                                }else{
                                  HighRiseNotes.update({dealurl: itaHighriseUrl + "/" + dealId + "/notes", 
                                                        body: trelloLink, 
                                                        id: dealId,
                                                        token: $scope.hrtokenIta,
                                                        country: 'ITA'},
                                  function(updatedNote){
                                    console.log("Note Updated",updatedNote);
                                  })
                                }
                              });
        }
      }

      ///////////////////////////////////////////////////////////////////////////////////////////
      //                    GDRIVE Section                                                     //
      ///////////////////////////////////////////////////////////////////////////////////////////
      var clientId="465342850022-uccefd9aoqoqum18ctcvg9vai1no554a.apps.googleusercontent.com";
      var apiKey = "AIzaSyAggTg6GPKQt710bFV4RiUfByLlKR1BGjg";
      var scopes = ["https://www.googleapis.com/auth/drive"];
      var accessToken;

      var PREV_PAVIMENTI_ID = "0B-mS2CSkk6pxaXl1TUd6R3hKWGM";
      var PREV_OUTDOOR_ID   = "0B-mS2CSkk6pxfmVxMDJ3TU11b04xYmx4Zi1ibGc4aG9VTjNRdTVpTko5aVN6WG9NZ1VKQk0";
      var PREV_CASE_ID      = "0B-mS2CSkk6pxfjFVd2JTUXFlRUljWThLX2loSWNVSnN4djJzamdIN3lxd25TOVlrRUlFMjA";
      var PREV_TETTI_ID      = "0B-mS2CSkk6pxfnJWbFVBRGNmcldFYTdVNUE0cFNUdFNvRXdmTDhnaE9ka2s1Zy10WjdPVDQ";


      var gdriveFolders;

      var folders = [{title: 'CH - Preventivi Tetti 2015' ,     fileId: PREV_TETTI_ID,        label: 'TETTI' },
                     {title: 'CH - Preventivi Pavimenti 2015',  fileId: PREV_PAVIMENTI_ID,    label: 'PARQUET' },
                     {title: 'CH - Preventivi Outdoor 2015' ,   fileId: PREV_OUTDOOR_ID,      label: 'OUTDOOR' },
                     {title: 'CH - Preventivi Case 2015'    ,   fileId: PREV_CASE_ID,         label: 'COSTRUZIONI' }
                    ];

      
      var folderTitles = [ {title: "0-9"},
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
                              gapi.client.load('drive', 'v2').then(checkAuth);
                            },100);
      };

      function checkAuth() {
        //console.log("CheckAuth")
        gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: true}, handleAuthResult);
      }
      //$interval(checkAuth, 2000);

      function handleAuthResult(authResult) {

        var authorizeButton = document.getElementById('authorize-button');
        if (authResult && !authResult.error) {
          //console.log(authResult, authResult.access_token);
          accessToken = authResult.access_token;
          //authorizeButton.style.visibility = 'hidden';
          populateFolders();
          $scope.$apply(function() { $scope.gdriveLoggedin = true} );
          
        } else {
          //authorizeButton.style.visibility = '';
          authorizeButton.onclick = handleAuthClick;
        }
      }

      function handleAuthClick(event) {
        gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: false}, handleAuthResult);
        return false;
      }


      


      var checkGDriveFolders = function(customer,dealId,title){
        //console.log("Customer",customer)
        //console.log("hrDeal",$scope.hrdeal)
        //console.log("Category",$scope.jobTypeModel,$scope.jobTypeOptions)
        var categoryLabel;

        $scope.jobTypeOptions.forEach(function(jt){
          if(jt.id === $scope.jobTypeModel.id)
            categoryLabel = jt.label;
        })

        //console.log("Set Category to ",categoryLabel)

        // Folder containing updated deal
        var selectedFolder;
        folders.forEach(function(f){
          if(f.label === categoryLabel)
            selectedFolder = f;
        });

        if(!selectedFolder)
          selectedFolder = folders[0];

        //console.log("Use folder",selectedFolder,gdriveFolders[selectedFolder.fileId])

        var gdriveItems;
        if(gdriveFolders[selectedFolder.fileId] && gdriveFolders[selectedFolder.fileId].result)
          gdriveItems = gdriveFolders[selectedFolder.fileId].result.items
        if(customer && gdriveItems && gdriveItems.length){

          var beginChar = customer.toUpperCase().charAt(0);
          for(var i=0; i < gdriveItems.length; i++){
            if(gdriveItems[i].title.indexOf(beginChar) != -1 && !gdriveItems[i].explicitlyTrashed){
              //console.log("set new folder to ",gdriveItems[i])

              // TODO: use folder parent
              var request = gapi.client.drive.files.list({
                'maxResults': '5000',
                'q': "mimeType = 'application/vnd.google-apps.folder'" //and title =  '" + gdriveItems[i].title + "'"
              });
              request
                .then(function(resp){
                  //console.log("GDrive folders",resp)


                  //console.log("resp",resp.result.items.length);
                  if(resp.result.items && resp.result.items.length){
                    var files = resp.result.items;
                    //console.log("Files",files);
                    for(var j=0; j < files.length; j++){
                      //console.log(files[j].title,dealId);
                      if(files[j].title.indexOf(dealId) != -1 && !files[j].explicitlyTrashed){
                        //console.log("found file",files[j]);
                        return files[j];
                      }
                    }
                  }
                },function(err){ console.log("Error",err)})
                .then(function(file){
                    var newgfolder;
                    if(selectedFolder && gdriveFolders[selectedFolder.fileId]){
                      var gfolders = gdriveFolders[selectedFolder.fileId].result.items;

                      var beginChar = customer.toUpperCase().charAt(0);
                      for(var i=0; i < gdriveItems.length; i++){
                        if(gfolders[i].title.indexOf(beginChar) != -1 && !gfolders[i].explicitlyTrashed){
                          newgfolder = gfolders[i];
                          break;
                        }
                      }
                    }

                    if(file && newgfolder){
                      
                      var removeParents = [];
                      if(parent && file.parents.length)
                        file.parents.forEach(function(p){
                          if(p.id === parent)
                            parent = null;
                          else
                            removeParents.push(p.id);
                        })
                      


                      var body = {'title': title};
                      //if(!parent)
                      //body.addParents = newgfolder.id;
                      //body.removeParents = removeParents.join();

                    


                      
                      var updRequest = gapi.client.drive.files.patch({
                            'fileId': file.id,
                            'resource': body,
                            'addParents': newgfolder.id, 
                            'removeParents': removeParents.join()
                          });
                      updRequest.execute(function(resp) {
                        console.log('Updated gdrive folder with new title', resp);

                        //updateTrelloLinks();

                        
                        

                      });
                    }else if(newgfolder){
                      //console.log("copyTemplateFiles",newgfolder);
                      $scope.copyTemplateFiles(newgfolder.id,title);

                    }
                })
              break;
            }
          }
        }
        
      }


      function retrieveAllFilesInFolder(folderId, callback) {
        var retrievePageOfChildren = function(request, result) {
          request.execute(function(resp) {
            result = result.concat(resp.items);
            var nextPageToken = resp.nextPageToken;
            if (nextPageToken) {
              request = gapi.client.drive.children.list({
                'folderId' : folderId,
                'pageToken': nextPageToken
              });
              retrievePageOfChildren(request, result);
            } else {
              callback(result);
            }
          });
        }
        var initialRequest = gapi.client.drive.children.list({
            'folderId' : folderId
          });
        retrievePageOfChildren(initialRequest, []);
      }

      var populateFolders = function(){
        var batch = gapi.client.newBatch();

        folders.forEach(function(f){
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
      

      $scope.copyTemplateFiles = function(containerFolderId, dealTitle){
        
        var request = gapi.client.request({
              'path': '/drive/v2/files',
              'method': 'GET',
              'params': {
                  'maxResults': '100',
                  'q': "title = '0 TEMPLATE' and mimeType = 'application/vnd.google-apps.folder'",

               }
            });


        request.then(function(resp){
          

          if(resp.result.items && resp.result.items[0] && !resp.result.items[0].explicitlyTrashed){
            var file = resp.result.items[0];
            $scope.gdriveRoot = { title: file.title,  fileId:  file.id, mimeType: file.mimeType, items: [], destId: containerFolderId }; // '0B55iJQF8ivu0WjlFY0pmLThrWWs'
            //console.log("$scope.gdriveRoot",$scope.gdriveRoot)
            walkDirectoryAndCopy(file.id,$scope.gdriveRoot,containerFolderId,dealTitle);
          }
        })
        
      }


      var createFolder = function(parentFolderId,title,folderId,parent){
        var data = new Object();
        data.title = title;
        data.parents = [{"id": parentFolderId}];
        data.mimeType = "application/vnd.google-apps.folder";
        gapi.client.drive.files.insert({'resource': data}).execute(
                                          function(result){ 
                                            if(result.title === $scope.updDealName){
                                              console.log("Update Trello Link from gapi insert",result);
                                              $scope.trelloDescLink1 = "https://drive.google.com/drive/folders/" + result.id + "\n\n";
                                              updateTrelloLinks();
                                            }

                                            //console.log("Folder Created",result);
                                            if(result.code == 403){
                                              $timeout(function(){
                                                        return createFolder(parentFolderId,title,folderId,parent);
                                                      },200);
                                            }else{
                                              //console.log("Folder Created",result);
                                              return walkDirectoryAndCopy(folderId,parent,result.id);
                                            }
                                          });
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
                              
                              if(entries.items)
                                return $q.all(entries.items.map(function(file) {
                                          
                                            //console.log(file.title + " - " + file.mimeType)
                                            if (file.mimeType === 'application/vnd.google-apps.folder' && !file.explicitlyTrashed) {
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
                                                        console.log("Update Trello Link from file copy");
                                                        updateTrelloLinks()
                                                      }
                                                      // update trello card with link
                                                    }
                                                    //return null;  // Don't wait for anything
                                                  });
                                                },200);
                                              }
                                          
                                        }));

                            });
                            //.then(function(){ console.log("Finished copy gdrive");}); // finish $q.all;
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

      //var templateCardId = "56054cdee8dfe86066e5f9d7";

      

      $scope.trelloDescRowsBottom  = "**Contratti, Fatturazione e Pagamenti Clienti**\n" +
                                     "Link!\n\n" +
                                     "**Link a Fornitori**\n" +
                                     "Link!";



      
      var upsertTrelloCard = function(dealId, dealUrl,cardTitle,customer,oldCardCategory){
        $rootScope.authorizeTrello();

        var oldTrelloList = tettiListPreventiviDaFareId;
        if(oldCardCategory === "COSTRUZIONI")
          oldTrelloList = caseListPreventiviDaFareId;
        else if(oldCardCategory === "TETTI")
          oldTrelloList = tettiListPreventiviDaFareId;
        else if(oldCardCategory === "OUTDOOR")
          oldTrelloList = outdooorListPreventiviDaFareId;
        else if($scope.hrdeal.data.deal.category.name === "PARQUET")
          oldTrelloList = floorListPreventiviDaFareId;

        if(oldCardCategory && oldCardCategory !== $scope.hrdeal.data.deal.category.name){
          // delete card if exists
          
          
          //console.log("Remove card from old list",oldTrelloList);

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
                    
                    Trello.delete("/cards/" + card.id)   
                          .then(function(result){
                            //console.log("Card Desc",card)
                            generateTrelloCard(dealId, dealUrl,cardTitle,customer,card.desc);
                          })
                  }else{
                    console.log("Create new Trello Card");
                    generateTrelloCard(dealId, dealUrl,cardTitle,customer);
                  }
                });

        }else { // update card
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
                    generateTrelloCard(dealId, dealUrl,cardTitle,customer,card.desc);
                  }else{
                    generateTrelloCard(dealId, dealUrl,cardTitle,customer);
                  }
                });
        } // end update card
      } // end upsertTrelloCard


      var generateTrelloCard = function(dealId, dealUrl,cardTitle,customer,cardDesc){
          if($scope.hrdeal.data.deal.category.name === "COSTRUZIONI"){
            listPreventiviDaFareId = caseListPreventiviDaFareId;
            templateCardId = caseTemplateCardId;
          }
          else if($scope.hrdeal.data.deal.category.name === "TETTI"){
            listPreventiviDaFareId = tettiListPreventiviDaFareId;
            templateCardId = tettiTemplateCardId;
          }
          else if($scope.hrdeal.data.deal.category.name === "OUTDOOR"){
            listPreventiviDaFareId = outdooorListPreventiviDaFareId;
            templateCardId = outdooorTemplateCardId;
          }
          else if($scope.hrdeal.data.deal.category.name === "PARQUET"){
            listPreventiviDaFareId = floorListPreventiviDaFareId;
            templateCardId = floorTemplateCardId;
          }else {
            listPreventiviDaFareId = tettiListPreventiviDaFareId;
            templateCardId = tettiTemplateCardId;
          }
          


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
                //console.log("checkGDriveFolders and update card")
                checkGDriveFolders(customer,dealId,$scope.updDealName);

              }
              else{
                
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

                        console.log("Create new card",newCard);

                       Trello.post("/cards",newCard,function(result){
                        console.log("Card Created Successfully - now update Highrise",result);


                        // Update HighriseNotes
                        updateHRNotes(dealId,result.url)
                        
                        // verifica le cartelle in GDrive
                        checkGDriveFolders(customer,dealId,$scope.updDealName);
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

          if($scope.hrdeal.data.deal.category.name === "COSTRUZIONI"){
            listPreventiviDaFareId = caseListPreventiviDaFareId;
            templateCardId = caseTemplateCardId;
          }
          else if($scope.hrdeal.data.deal.category.name === "TETTI"){
            listPreventiviDaFareId = tettiListPreventiviDaFareId;
            templateCardId = tettiTemplateCardId;
          }
          else if($scope.hrdeal.data.deal.category.name === "OUTDOOR"){
            listPreventiviDaFareId = outdooorListPreventiviDaFareId;
            templateCardId = outdooorTemplateCardId;
          }
          else if($scope.hrdeal.data.deal.category.name === "PARQUET"){
            listPreventiviDaFareId = floorListPreventiviDaFareId;
            templateCardId = floorTemplateCardId;
          }else{
            listPreventiviDaFareId = tettiListPreventiviDaFareId;
            templateCardId = tettiTemplateCardId;
          }


          Trello.get("/lists/" + listPreventiviDaFareId + "/cards") 
                            .then(function(cardList){
                              console.log("CardList preventivi da fare",cardList)
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
                                    console.log("Update with new links",response);
                                  });

                              }


                            });
          }
          else
            console.log("Undefined hrdeal");
      }




  });
