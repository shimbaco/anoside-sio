var utils = require('connect').utils
  , io = require('socket.io').listen(4000)
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
  socket.on('createPost', function (data) {
    socket.broadcast.emit('showPost', data);
  });

  socket.on('createComment', function (data) {
    socket.broadcast.emit('showComment', data);
  });

  socket.on('createTag', function (data) {
    socket.broadcast.emit('showTag', data);
  });

  socket.on('deleteTag', function (data) {
    socket.broadcast.emit('deleteTag', data);
  });
});

var tags = io.of('/tags').on('connection', function (socket) {
  socket.on('joinTagRoom', function (data) {
    socket.join(data);
  });
});
