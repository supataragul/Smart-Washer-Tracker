'use strict';
/* Require shared configuration variables, eg. our Google Project ID */
var config = require('./config');

/* Require "tracker" service for querying, creating, and deleting */
var tracker = require('./tracker')(config);

/* Require "auth" service for authenticating users and getting profile info */
var auth = require('./auth')(config);

/* Require Express web framework and Express middleware */
var express = require('express');
//var multer = require('multer');
var session = require('cookie-session');
var bodyParser = require('body-parser');
var nodemailer = require('nodemailer');
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(config.oauth2.clientId);

/* Configure Express web application */
var app = express();
app.use(express.static('style'));
app.use(express.static('scripts'));
app.use(express.static('images'));
app.use(express.static('assets'));
app.set('view engine', 'jade');
app.enable('trust proxy');
//app.use(multer({ inMemory: true }));
app.use(session({ signed: true, secret: config.cookieSecret }));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

function logErr(err){
  console.log("-----ERROR-----");
  console.log(err);
}

var sendEmail = function(toEmail, subject, message){
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.email,
      pass: config.emailPassword
    }
  });

  var mailOptions = {
    from: config.email,
    to: toEmail,
    subject: subject,
    html: '<table><tr style="background-color: #343a40"><td align="center" style="font-size: xx-large;color: white;padding: 30;">SMART WASHER TRACKER</td></tr><tr><td align="center" style="font-size: x-large;">'+message+'</td></tr><tr><td align="center">Smart Washer Tracker</td></tr></table>'
  };

  transporter.sendMail(mailOptions, function(err, info){
    if (err){
      logErr(err);
    }
    else {
      console.log('Email sent: ' + info.response + ' to ' + toEmail);
    }
  });
}

// Get all trackers history that have been used
var getUserTrackersHistory = function(req, callBack){
  if (! req.session.user) return;
  tracker.getUserTrackers(req.session.user.id, function(err, trackers) {
    if (err) return err;
    var allTrackers = [];
    if(trackers.length > 0){
      var i=0;

      var loop = function (trackers){
        tracker.getTrackerHistory(trackers[i].tracker_id, function(err, entities) {
          if (err) return err;
          if(entities.length>0){
            var eachTracker = {tracker_id: trackers[i].tracker_id, data: []};
            for (var j = 0; j < entities.length; j++) {
              eachTracker.data.push(entities[j]);
            }
            allTrackers.push(eachTracker);
          }
          i++;
          if(i < trackers.length){
              loop(trackers);
          }else{
            callBack({ userTrackers: trackers, trackers: allTrackers});
          }
        });
      }
      loop(trackers);
    }else{
      callBack({ userTrackers: trackers, trackers: allTrackers});
    }
  });
}

// Get all trackers that have been used
var getUserTrackers = function(req, callBack){
  if (! req.session.user) return;
  tracker.getUserTrackers(req.session.user.id, function(err, trackers) {
    console.log(trackers);
    if (err) return err;
    var allTrackers = [];
    if(trackers.length > 0){
      var i=0;
      var loop = function (trackers){
        tracker.getTracker(trackers[i].tracker_id, function(err, entities) {
          if (err) return err;
          if(entities.length>0)
            allTrackers.push(entities[0]);
          i++;
          if(i < trackers.length){
              loop(trackers);
          }else{
            callBack({ userTrackers: trackers, trackers: allTrackers});
          }
        });
      }
      loop(trackers);
    }else{
      callBack({ userTrackers: trackers, trackers: allTrackers});
    }
  });
}

// Get all trackers even the trackers are do not use
var getUserAllTrackers = function(req, callBack){
  getUserTrackers(req, function(data){
    for (var i = 0; i < data.userTrackers.length; i++) {
      for (var j = 0; j < data.trackers.length; j++) {
        if(data.userTrackers[i].tracker_id == data.trackers[j].tracker_id){
          data.userTrackers[i] = data.trackers[j];
        }
      }
    }
    console.log("getUserAllTrackers ---- : " + data);
    callBack(data);
  });
}

var checkSession = function(req, res){
  var ip = req.headers['x-forwarded-for'] || 
     req.connection.remoteAddress || 
     req.socket.remoteAddress ||
     (req.connection.socket ? req.connection.socket.remoteAddress : null);
  
  console.log("Check session");
  if (! req.session.user) {
    console.log("IP -------------- : "+ip);
    console.log("No session");
    return res.redirect('/');
  }
  var resData = {};
  resData.user = req.session.user;

  console.log("IP -------------- : "+ip);
  console.log(req.url);
  console.log(resData);
  return resData;
}

app.get('/', function(req, res) {
  var resData = {};
  if (!req.session.user) {
    res.render('index', {resData: resData});
  }else{
    res.redirect('/home');
  }
});

app.get('/home', function(req, res) {
  var resData = {};
  resData = checkSession(req, res);
  getUserTrackers(req, function(data){
    resData.data = data;
    res.render('home', {resData: resData});
  });
  
});


app.get('/report', function(req, res) {
  
  var resData = {};
  resData = checkSession(req, res);
  getUserTrackersHistory(req, function(data){
    resData.data = data;
    res.render('report', {resData: resData});
  });
});

app.get('/devices', function(req, res) {
  var resData = {};
  resData = checkSession(req, res);
  getUserAllTrackers(req, function(data){
    resData.data = data;
    res.render('devices', {resData: resData});
  });
  
});

app.get('/QRAddDevice', function(req, res) {
  var tracker_id = req.query.tracker_id;
  var authenticationUrl = auth.getAuthenticationUrlForAddDevice(tracker_id);
  res.redirect(authenticationUrl);
});

app.get('/oauth2callbackAddDevice', function(req, res) {
  var tracker_id = req.query.state;
  auth.getUserFromAddDevice(req.query.code, function(err, user) {
    if (err) {
      logErr(err);
      return err;
    }
    req.session.user = user;
    var userId = req.session.user.id;
    var userEmail = req.session.user.email;
    var addTracker = {trackerId: tracker_id};
    
    tracker.addDevice(userId, userEmail, addTracker, function(msg){
      console.log("oauth2callbackAddDevice ---- : " + msg);
      var resData = {};
      resData = checkSession(req, res);
      getUserAllTrackers(req, function(data){
        resData.data = data;
        resData.data.status = msg;
        res.render('devices', {resData: resData});
      });
    });
  });
});

/* Redirect user to OAuth 2.0 login URL */
app.get('/login', function(req, res) {
  var authenticationUrl = auth.getAuthenticationUrl();
  res.redirect(authenticationUrl);
});

/* Use OAuth 2.0 authorization code to fetch user's profile */
app.get('/oauth2callback', function(req, res) {
  auth.getUser(req.query.code, function(err, user) {
    if (err) {
      logErr(err);
      return err;
    }
    req.session.user = user;
    res.redirect('/home');
  });
});

/* Clear the session */
app.get('/logout', function(req, res) {
  req.session = null;
  res.redirect('/');
});

app.post('/getTrackers', function(req, res) {
  checkSession(req, res);
  getUserTrackers(req, function(data){
    res.json(data);
  });
});

app.post('/getUserAllTrackers', function(req, res) {
  checkSession(req, res);
  getUserAllTrackers(req, function(data){
    res.json(data);
  });
});

app.post('/addDevice', function(req, res) {
  checkSession(req, res);
  var userId = req.session.user.id;
  var userEmail = req.session.user.email;
  var addTracker = req.body;
  
  tracker.addDevice(userId, userEmail, addTracker, function(msg){
    console.log("addDevice ---- : "+msg);
    getUserAllTrackers(req, function(data){
      data.status = msg;
      res.json(data);
    });
  });
});

app.post('/deleteDevice', function(req, res) {
  checkSession(req, res);
  var userId = req.session.user.id;
  var deleteTracker = req.body;
  
  tracker.deleteDevice(userId, deleteTracker, function(msg){
    console.log("deleteDevice ---- : "+msg);
    getUserAllTrackers(req, function(data){
      data.status = msg;
      res.json(data);
    });
  });
});

app.post('/trackerApi', function(req, res) {
  console.log("-------- Tracker API ---------");
  var tracker_id = req.body.tracker_id;
  var running_status = false;

  console.log(tracker_id);

  if(req.body.running_status.toLowerCase() == "true"){
    running_status = true;
  }
  

  tracker.addTrackerStatus(tracker_id, running_status, function(msg){
    console.log("addTrackerStatus ---- : "+msg);
    res.json(msg);
  });

  tracker.findUsersByTracker(tracker_id, function(err, entities) {
    if (err) return err;
    var subject = '';
    var message = '';
    if(running_status){
      subject = 'Smart Washer Tracker is Running';
      message = 'The washer '+tracker_id+' is running.';
    }else{
      subject = 'Smart Washer Tracker is Finished';
      message = 'The washer '+tracker_id+' is finished.';
    }
    for (var i = 0; i < entities.length; i++){
      sendEmail(entities[i].user_email, subject, message);
    }
  });
  
});

app.post('/googleHomeApi', function(req, res) {
  //checkSession(req, res);
  console.log("-------- Google Home API ---------");
  console.log("-- Body --");
  console.log(req.body);
  console.log("-- User --");
  console.log(req.body.originalDetectIntentRequest.payload.user);

  var token = req.body.originalDetectIntentRequest.payload.user.idToken;
  async function verify() {
    const ticket = await client.verifyIdToken({
        idToken: token
    });
    const payload = ticket.getPayload();
    const user_id = payload['sub'];
    const user_name = payload['name'] || payload['email'].substring(0, payload['email'].lastIndexOf("@"));


    var userId = user_id;
    req.session = {user:{id: userId}}
    getUserTrackers(req, function(data){

      var textToSpeech = "Hello! "+user_name+". Your ";
      if(data.trackers.length<=0){
        textToSpeech = "Hello! "+user_name+". You don't have any tracker in used.";
      }else{
        for (var i = 0; i < data.trackers.length; i++) {
          var trackerIdReplace = data.trackers[i].tracker_id.replace(/^0+/,'');
          textToSpeech += "tracker "+trackerIdReplace+" is ";
          if(data.trackers[i].running_status){
            textToSpeech += "washing, ";
          }else{
            textToSpeech += "finished, ";
          }
        }
      }

      var response = {
        "payload": {
          "google": {
            "expectUserResponse": false,
            "richResponse": {
              "items": [
                {
                  "simpleResponse": {
                    "textToSpeech": textToSpeech
                  }
                }
              ]
            }
          }
        }
      }
      console.log(textToSpeech);
      console.log(response);
      
      res.json(response);  
    });
  }

  verify().catch(console.error);
});

/* Run web application */
if (module === require.main) {
  // [START server]
  // Start the server
  const server = app.listen(process.env.PORT || 8080, () => {
    const port = server.address().port;
    console.log(`App listening on port ${port}`);
  });
  // [END server]
}

module.exports = app;
