function logErr(err){
  console.log("-----ERROR-----");
  console.log(err);
}

module.exports = function(config) {
  var gDatastore = require('@google-cloud/datastore');
  
  var datastore = gDatastore({
    projectId: config.projectId,
    keyFilename: config.keyFilename
  });

  var runQuery = function(query, callback, key){
    datastore.runQuery(query, function(err, entities){
      // if(entities == undefined){
      //   entities = [];
      //   err = null;
      // }else if(err){
      //   logErr(err);
      // }

      if(err){
        logErr(err);
      }

      callback(err, entities, key);
    });
  }

  function findUsersByTracker(trackerId, callback){
    var query = datastore.createQuery(['user'])
    .filter('tracker_id', '=', trackerId);
    runQuery(query, callback, datastore.KEY);
    //datastore.runQuery(query, (err, entity) => callback(err, entity, datastore.KEY));
  }


  function getUserTrackers(userId, callback) {
    var query = datastore.createQuery(['user'])
    .filter('user_id', '=', userId)
    .groupBy('tracker_id')
    .order('tracker_id');
    runQuery(query, callback, datastore.KEY);
    //datastore.runQuery(query, (err, trackers) => callback(err, trackers, datastore.KEY));
  }

  function getTracker(trackerId, callback) {
    var query = datastore.createQuery(['tracker'])
    .filter('tracker_id', '=', trackerId)
    .order('time', {descending: true,})
    .limit(1);
    runQuery(query, callback, datastore.KEY);
  }

  function getTrackerHistory(trackerId, callback) {
    var query = datastore.createQuery(['tracker'])
    .filter('tracker_id', '=', trackerId)
    .filter('running_status', '=', false)
    .order('time', {descending: true,});
    runQuery(query, callback, datastore.KEY);
    //datastore.runQuery(query, (err, trackers) => callback(err, trackers, datastore.KEY));
  }

  function getUserTracker(userId, trackerId, callback) {
    var query = datastore.createQuery(['user'])
    .filter('user_id', '=', userId)
    .filter('tracker_id', '=', trackerId);
    runQuery(query, callback, datastore.KEY);
    //datastore.runQuery(query, (err, entity) => callback(err, entity, datastore.KEY));
  }

  function addTrackerStatus(trackerId, runningStatus, callback) {
    var entity = {
      key: datastore.key('tracker'),
      data: {
        tracker_id: trackerId,
        running_status: runningStatus,
        time: new Date()
      }
    };

    datastore.save(entity).then(function(){
      callback("Saved");
    });
  }

  function addDevice(userId, userEmail, tracker, callback) {
    if(tracker.trackerId){
      getUserTrackers(userId, function(err, trackers, key){
        // Check duplicate data
        for (var i = 0; i < trackers.length; i++) {
          if(trackers[i].tracker_id == tracker.trackerId){
            return callback("Duplicated");
          }
        }
        var entity = {
          key: datastore.key('user'),
          data: {
            tracker_id: tracker.trackerId,
            user_id: userId,
            user_email: userEmail
          }
        };

        datastore.save(entity).then(function(){
          callback("Added");
        });
      });
    }else{
      return callback("Empty Id");
    }
  }

  function deleteDevice(userId, tracker, callback) {
    getUserTracker(userId, tracker.trackerId, function(err, entities, key){

      var keyEntity = entities.map((entity) => Object.assign(entity, { id: entity.id || entity[key].id }));
      
      var key = datastore.key(['user', parseInt(keyEntity[0].id) ]);

      datastore.get(key, function(err, tracker) {
        if (err) return callback(err);
        datastore.delete(key).then(function(){
          callback("Deleted");
        });
      });
    });
  }

  return {
    getUserTrackers: getUserTrackers,
    getTracker: getTracker,
    addDevice: addDevice,
    deleteDevice: deleteDevice,
    findUsersByTracker: findUsersByTracker,
    addTrackerStatus: addTrackerStatus,
    getTrackerHistory: getTrackerHistory
  };
};
