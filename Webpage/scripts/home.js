'use strict';
app.controller('homeCtrl',function($rootScope,$scope,$interval) {
// Declaration
  $scope.getTrackers = function () {
    $rootScope.callService("/getTrackers",{},function(data)
    {
      $scope.data = data;
      console.log($scope.data);
    });
  };


// main
  $scope.data = $rootScope.data;

  // update status every 30 second
  $interval(function(){
    $scope.getTrackers();
  },30000);

});
