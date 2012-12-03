var io                   = require('socket.io'),
    express              = require('express'),
    http                 = require('http'),
    cookie               = require('cookie'),
    Context              = require('./context').Context,
    login                = require('./login').login,
    chat_outside         = require('./chat_outside').chat_outside,
    exit                 = require('./exit').exit,
    create_room          = require('./create_room').create_room,
    exit_room            = require('./exit_room').exit_room,
    request_update_rooms = require('./update_rooms').request_update_rooms,
    update_rooms         = require('./update_rooms').update_rooms,
    join_room            = require('./join_room').join_room,
    start_game           = require('./start_game').start_game,
    get_timer            = require('./get_timer').get_timer,
    stop_s               = require('./stop').stop_s,
    stop_response        = require('./stop_response').stop_response,
    next_response        = require('./next_response').next_response,
    ready                = require('./ready').ready,
    change_name          = require('./change_name').change_name,
    chat_inside          = require('./chat_inside').chat_inside,
    app                  = express(),
    server               = null,
    User                 = require('./user').User;
    
app.configure(function () {
    app.use(express.cookieParser());
    app.use(express.session({
        secret: 'iaa_secret',
        key: 'express_id'
    }));
    app.use(express.static(__dirname + '/public'));
     
});

var s = app.listen(process.env.PORT || 8080);

server = io.listen(s).set( 'log level', 1 );

server.configure(function(){
    server.set("transports", ['xhr-polling']);
    server.set('polling duration', 10);
});

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

function ContextUserLogged() {
    return this.current_user.is_logged;
};

server.sockets.on( 'connection', function( socket ) {
    var hs = socket.handshake;
    socket.context = context;
    if (socket.context.sessions[hs.sessionID] == undefined) {
        socket.user = new User();
        socket.context.users[socket.user.id] = socket.user;
        socket.context.sessions[hs.sessionID] = socket.user;
    } else {
        socket.user = socket.context.sessions[hs.sessionID];
    }
    socket.user_logged = function() {
        return socket.user.is_logged;
    };
    if (socket.user_logged()) {
        socket.join("user" + socket.user.id);
        
        
        if (socket.user.room != null) {
            var room = socket.context.rooms[socket.user.room];
            socket.join("room" + room.id);
            socket.emit('logged_in', { user: socket.user, update: false });
            room.room_update(socket, true, false, true, false);
        } else {
            socket.join("out");
            socket.emit('logged_in', { user: socket.user, update: true });
            update_rooms(socket, true, false);
        }
    }


    login(socket);
    exit(socket);
    chat_outside(socket);
    create_room(socket);
    exit_room(socket);
    request_update_rooms(socket);
    join_room(socket);
    start_game(socket);
    get_timer(socket);
    stop_s(socket);
    stop_response(socket);
    next_response(socket);
    ready(socket);
    change_name(socket);
    chat_inside(socket);

    socket.on('debug', function(data){
        socket.emit('debug', {context: socket.context, user:socket.user})
    });

});