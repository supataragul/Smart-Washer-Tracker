'use strict';
app.controller('reportCtrl',function($rootScope,$scope,$timeout) {
// Declaration
  $scope.getUserAllTrackers = function () {
    $rootScope.callService("/getUserAllTrackers",{},function(data)
    {
      $scope.data = data;
      console.log($scope.data);
    });
  };

  function findDate(array, find){
    for (var i = 0; i < array.length; i++) {
      if(array[i].date.getTime() == find.getTime()){
        return i;
      }
    }
    return false;
  }


// main
  $scope.data = $rootScope.data;
    //Better to construct options first and then pass it as a parameter
    // var labels = [], data=[];
    // results["packets"].forEach(function(packet) {
    //   labels.push(new Date(packet.timestamp).formatMMDDYYYY());
    //   data.push(parseFloat(packet.payloadString));
    // });
  var color = ["#66d9ff", "#b366ff", "#66ff66", "#ffff66", "#ffb366","#ff6666","#6666ff"];
  var data = [];
  for (var i = 0; i < $scope.data.trackers.length; i++) {
    var dataPoints = [];
    var days = [];
    for (var j = 0; j < $scope.data.trackers[i].data.length; j++) {
      var day = new Date($scope.data.trackers[i].data[j].time);
      day.setHours(0, 0, 0, 0);
      if(days.length<=0){
        days.push({date: day, count: 1});
      }else{
        var check = findDate(days, day);
        if(check === false) {
          days.push({date: day, count: 1});
        }else{
          days[check].count++;
        }
      }     
    }

    for (var j = 0; j < days.length; j++) {
      dataPoints.push({ x: new Date(days[j].date), y: days[j].count});
    }
    

    var tempData = {
      type: "line",
      showInLegend: true,
      name: $scope.data.trackers[i].tracker_id,
      markerType: "square",
      xValueFormatString: "DD MMM YYYY",
      color: color[i%color.length],
      dataPoints: dataPoints
    }

    data.push(tempData);
  }
    
  var options = {
    title: {
      text: "Smart Washer Tracker"
    },
    theme: "light2",
    animationEnabled: true,
    exportEnabled: true,
    axisX:{
      valueFormatString: "MMM, DD"
    },
    axisY: {
      title: "Number of uses",
      minimum: 0
    },
    data: data
  };
  $("#chartContainer").CanvasJSChart(options);


});
