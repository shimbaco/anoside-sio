var utils = require('connect').utils
  , io = require('socket.io').listen(8080)
  , redis = require('redis');

var client = redis.createClient()
  , parseCookie = utils.parseCookie;


io.configure(function () {
  io.set('authorization', function (handshakeData, callback) {
    var cookie = handshakeData.headers.cookie;

    var findByCookie = function (cookie, callback) {
      var parsedCookie = parseCookie(cookie)
        , connectSID = parsedCookie['connect.sid'];

      client.get(connectSID, function (err, reply) {
        var userId = JSON.parse(reply).user_id;

        if (userId) {
          console.log('ユーザID: ' + userId);
          var user = { id: userId };
          return callback(null, user);
        }
        return callback(null, false);
      });
    };
    
    findByCookie(cookie, function (err, user) {
      if (err) return callback(err);
      if (!user) return callback(null, false);
      handshakeData.user = user;
      callback(null, true);
    });
  });
});

io.sockets.on('connection', function (socket) {
});
