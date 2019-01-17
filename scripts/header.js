'use strict';

app.controller('headerCtrl',function($rootScope,$scope,$timeout) {

  var obj = {"test": "yeah"};
  $scope.testFunc = function () {
    console.log("run testFunc");
    $rootScope.callService("/getTracker",obj,function(data)
    {
      console.log("SUCCESS");
      console.log(data);
    });
  };
});
