'use strict';
app.controller('devicesCtrl',function($rootScope,$scope,$timeout) {
// Declaration
  function checkStatus(){
    if($scope.data.status == "Duplicated"){
      $rootScope.msg = "You already have this tracker."
      $('#myModal').modal('toggle');
      $timeout(function(){
        $('#modalButton').focus();
      });
    }else if($scope.data.status == "Added"){
      $rootScope.msg = "The tracker was added."
      $('#myModal').modal('toggle');
      $timeout(function(){
        $('#modalButton').focus();
      });
    }else if($scope.data.status == "Deleted"){
      $rootScope.msg = "The tracker was deleted."
      $('#myModal').modal('toggle');
      $timeout(function(){
        $('#modalButton').focus();
      });
    }
  }
  $scope.getUserAllTrackers = function () {
    $rootScope.callService("/getUserAllTrackers",{},function(data)
    {
      $scope.data = data;
      console.log($scope.data);
    });
  };

  $scope.addDevice = function () {
    $rootScope.callService("/addDevice",$scope.tracker,function(data)
    {
      $scope.tracker.trackerId = "";
      $scope.data = data;
      checkStatus();
    });
  };

  $scope.deleteDevice = function (trackerId) {
    var sent = {trackerId: trackerId};
    console.log(sent);
    $rootScope.callService("/deleteDevice", sent, function(data)
    {
      $scope.data = data;
      checkStatus();
    });
  };


// main
  $scope.data = $rootScope.data;
  checkStatus();
  //$scope.getUserAllTrackers();

});
