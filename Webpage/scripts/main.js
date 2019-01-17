var app = angular.module('appApp', []);

app.run(function($rootScope,$location,$http,$timeout) {

  //----Check console log
  var alertFallback = false;//alert console.log for ie8
  var closeAllLog = false;//console.log is not show
  if (typeof console === "undefined" || typeof console.log === "undefined") {
    console = {};
    if (alertFallback) {
       console.log = function(msg) {
            alert(msg);
       };
    } else {
       console.log = function() {};
    }
  }else if(closeAllLog){
    console = {};
    console.log = function() {};
  }
  //----End check

  console.log(resData);
  $rootScope.data = resData.data;
  $rootScope.user = resData.user;
  console.log($rootScope);

  var config = { headers : {'Content-Type': 'application/json'}}
  

  $rootScope.callService = function(url,req,callBack){
    console.log(req);
    $http.post(url, req, config).then(function(data) {
      console.log(data);
      callBack(data.data); 
      // if(data.result==="SUCCESS"){
      //   callBack(data);     
      // }
      // else{
      // }
    });
  }

});
