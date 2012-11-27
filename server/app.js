var io           = require('socket.io'),
    express      = require('express'),
    app          = express(),
    http         = require('http'),
    server       = null,
    cookie       = require('cookie'),
    MemoryStore  = express.session.MemoryStore,
    sessionStore = new MemoryStore(),
    Context      = require('./context').Context;

app.configure(function () {
    app.use(express.cookieParser());
    app.use(express.session({
        secret: 'iaa_secret',
        key: 'express_id'
    }));
    app.use(express.static(__dirname + '/public'));
     
});

var s = app.listen(8080);

server = io.listen(s).set( 'log level', 1 );

server.set('authorization', function(data, accept) {
    if (data.headers.cookie) {
        data.cookie = cookie.parse(data.headers.cookie);
        data.sessionID = data.cookie['express_id'].substring(2, 26);
    } else {
        return accept('No cookie transmitted.', false);
    }
    accept(null, true);
});

context = new Context();

server.sockets.on( 'connection', function( socket ) {
    var hs = socket.handshake;
    context.create_session(hs.sessionID);
});