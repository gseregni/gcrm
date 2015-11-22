'use strict';

angular.module('galimbertiCrmApp')
  .controller('MainCtrl', function ($rootScope, $scope, $http, $q, $timeout,$interval, localStorageService, HighRiseDeal,HighRisePeople,HighRiseDealCategory) {
	   


  		$scope.hrtokenIta =  localStorageService.get("hrtokenIta");   // = "1dcf57fc8ac60618e1219f8849b0b7ff"
  		$scope.hrtokenSwi  = localStorageService.get("hrtokenSwi");  //= "0b7bc01934a438ff224d9f0be9da7c29";

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

  			$scope.hrtokenIta =  localStorageService.get("hrtokenIta");   // = "1dcf57fc8ac60618e1219f8849b0b7ff"
  			$scope.hrtokenSwi  = localStorageService.get("hrtokenSwi");  //= "0b7bc01934a438ff224d9f0be9da7c29";
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
          var dealurl = $scope.dealurl
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
                console.log("Categories",cats);

                $scope.jobTypeOptions = [];
                if(cats['deal-categories'] && cats['deal-categories']['deal-category'] && cats['deal-categories']['deal-category'].length){
                  var categories = cats['deal-categories']['deal-category'];
                  categories.forEach(function(d){
                    $scope.jobTypeOptions.push({id: d.id['$t'] , label: d.name}) ;
                  });
                  $scope.jobTypeModel.id = deal.data.deal['category-id']['$t'];
                }

              });

              console.log("hrdeals",$scope.hrdeal);
              
                
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
                console.log("Categories",cats);

                $scope.jobTypeOptions = [];
                if(cats['deal-categories'] && cats['deal-categories']['deal-category'] && cats['deal-categories']['deal-category'].length){
                  var categories = cats['deal-categories']['deal-category'];
                  categories.forEach(function(d){
                    $scope.jobTypeOptions.push({id: d.id['$t'] , label: d.name}) ;
                  });
                  $scope.jobTypeModel.id = deal.data.deal['category-id']['$t'];
                }

              });

              console.log("hrdeals",$scope.hrdeal);
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
                  author = d.label.toUpperCase().charAt(0) + d.label.toUpperCase().charAt(d.label.indexOf(" ") + 1)
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

  				hrd.$update(function(res){
  					console.log("Result",res);
  					$scope.hrdeal = res;
            $scope.resultDealName = res.data.deal.name;

            // Upsert Trello
            //if(res && res.data.deal)
            //  
            if(res && res.data.deal && country === "SWI"){
              upsertTrelloCard(res.data.deal.id['$t'], $scope.dealurl, res.data.deal.name,customer)
            }

  				})

          

  			}else
  				$scope.hrValidationMsg = "Invalid Link";
  		}

      ///////////////////////////////////////////////////////////////////////////////////////////
      //                    GDRIVE Section                                                     //
      ///////////////////////////////////////////////////////////////////////////////////////////
      var clientId="465342850022-uccefd9aoqoqum18ctcvg9vai1no554a.apps.googleusercontent.com";
      var apiKey = "AIzaSyAggTg6GPKQt710bFV4RiUfByLlKR1BGjg";
      var scopes = ["https://www.googleapis.com/auth/drive"];
      var accessToken;

      var folders = [
                     {title: "0-9"},
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
                     {title: "U-v-W-Y-Z"}
                    ]



      
      //$timeout(checkAuth, 500);      

      $scope.gdriveLoggedin;

      $rootScope.gDriveLogin=function() {
        $timeout(function(){
                              gapi.client.setApiKey(apiKey);
                              gapi.client.load('drive', 'v2').then(checkAuth);
                            },100);

        //window.setTimeout(checkAuth,1);
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
          setDealFoldersId();
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
        if(customer){
          var beginChar = customer.toUpperCase().charAt(0);
          for(var i=0; i < folders.length; i++){
            if(folders[i].title.indexOf(beginChar) != -1){
              var request = gapi.client.drive.files.list({
                'maxResults': '500',
                'q': "mimeType = 'application/vnd.google-apps.folder' and '" + folders[i].folderId + "' in parents"
              });
              request.then(function(resp){
                //console.log("resp",resp);
                if(resp.result.items && resp.result.items.length){
                  var files = resp.result.items;
                  //console.log("Files",files);
                  for(var j=0; j < files.length; j++){
                    //console.log(files[j].title,dealId);
                    if(files[j].title.indexOf(dealId) != -1){
                      return files[j];
                    }
                  }
                }
              },function(err){ console.log("Error",err)}).then(function(file){ 
                  if(file){
                    var body = {'title': title};
                    var updRequest = gapi.client.drive.files.patch({
                          'fileId': file.id,
                          'resource': body
                        });
                    updRequest.execute(function(resp) {

                      console.log('Updated gdrive folder with new title', resp.title);
                      //updateTrelloLinks();
                    });
                  }else{
                    $scope.copyTemplateFiles(folders[i].folderId,title);

                  }



              })
              break;
            }
          }
        }
        
      }


      var setDealFoldersId = function(){
        var rootRequest = gapi.client.request({
              'path': '/drive/v2/files',
              'method': 'GET',
              'params': {
                  'maxResults': '1',
                  'q': "title = 'CH - Preventivi Tetti 2015' and mimeType = 'application/vnd.google-apps.folder'",

               }
            });

        

        rootRequest.then(function(resp){
          if(resp.result.items[0]){
            $scope.basePreventiviFolderId = resp.result.items[0].id;

            var request = gapi.client.request({
              'path': '/drive/v2/files',
              'method': 'GET',
              'params': {
                  'maxResults': '100',
                  'q': "mimeType = 'application/vnd.google-apps.folder' and '" + $scope.basePreventiviFolderId + "' in parents",

               }
            });

            request.execute(function(response){
              var items = response.items;
              console.log(response);
              if(items && items.length){ 
                for(var i =0; i < items.length; i++){
                  for(var j =0; j < folders.length; j++){
                    if(items[i].title === folders[j].title)
                      folders[j].folderId = items[i].id;

                  }
                }
                console.log("Populate folders",folders);
              }
            },function(err){ console.log("Error",err)});

          }

          
        },function(merr){ 
          $scope.$apply(function() { $scope.gdriveLoggedin = false} );
          var authorizeButton = document.getElementById('authorize-button');
          authorizeButton.style.visibility = '';
          authorizeButton.onclick = handleAuthClick;
          return false;
            
        });


      }
      

      $scope.copyTemplateFiles = function(containerFolderId, dealTitle){
        
        var request = gapi.client.request({
              'path': '/drive/v2/files',
              'method': 'GET',
              'params': {
                  'maxResults': '1',
                  'q': "title = '0 TEMPLATE' and mimeType = 'application/vnd.google-apps.folder'",

               }
            });


        request.then(function(resp){
          console.log("Resp",resp);
          if(resp.result.items && resp.result.items[0]){
            var file = resp.result.items[0];
            $scope.gdriveRoot = { title: file.title,  fileId:  file.id, mimeType: file.mimeType, items: [], destId: containerFolderId }; // '0B55iJQF8ivu0WjlFY0pmLThrWWs'
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
                                              console.log("Update Trello Link",result);
                                              $scope.trelloDescLink1 = "https://drive.google.com/drive/u/0/folders/" + result.id + "\n\n";
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
                                            if (file.mimeType === 'application/vnd.google-apps.folder') {
                                                $timeout(function(){
                                                  var origParent = { title: file.title,  fileId:  file.id, mimeType: file.mimeType, items: [] };
                                                  parent.items.push(origParent);
                                                  return createFolder(destId,folderTitle ? folderTitle : file.title,file.id,origParent);

                                                },200);
                                               
                                            } else {
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
                                                      console.log('Copy ID: ' , resp);
                                                      if(resp.title === "Preventivo e Ordine 2.0")
                                                      {
                                                        $scope.trelloDescLink2 = "https://docs.google.com/spreadsheets/d/" + resp.id + "/edit\n\n";
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
      var boardId = "BNBe9zmb";
      var listEmptyCardId = "55881caf1a5446f4de06a100";
      var listPreventiviDaFareId = "55881caf1a5446f4de06a101";
      var templateCardId = "56054cdee8dfe86066e5f9d7";

      

      $scope.trelloDescRowsBottom  = "**Contratti, Fatturazione e Pagamenti Clienti**\n" +
                                     "Link!\n\n" +
                                     "**Link a Fornitori**\n" +
                                     "Link!";



      
      var upsertTrelloCard = function(dealId, dealUrl,cardTitle,customer){
        $rootScope.authorizeTrello();

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
              
              Trello.put("/cards/" + card.id, {name: cardTitle, desc: desc},function(response){
                console.log("Update card",response);
                // verifica le cartelle in GDrive
                checkGDriveFolders(customer,dealId,$scope.updDealName);

              });

            }
            else{
              console.log("Create new card");
              // Template Card
              Trello.get("/cards/" + templateCardId)
                .then(function(card){
                  if(card){
                     var newCard = {
                        name: cardTitle,
                        idCardSource: card.id,
                        due: "",
                        idList: listPreventiviDaFareId,
                        pos: "bottom",
                        desc: desc

                      };

                     console.log("template card",card);
                     

                     Trello.post("/cards",newCard,function(result){
                      console.log("Card Created Successfully",result);
                      // verifica le cartelle in GDrive
                      checkGDriveFolders(customer,dealId,$scope.updDealName);
                     })
                  }

                  return card;
              })



            }

          })
      } // end upsertTrelloCard

      var updateTrelloLinks = function(){

        if($scope.hrdeal){
          var dealId = $scope.hrdeal.data.deal.id['$t'];


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
