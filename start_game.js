var action_code  = "8",
	Room         = require('./room').Room,
	update_rooms = require('./update_rooms').update_rooms;
   

var start_game = function(socket) {
	socket.on("start_game", function(data) {
		if (!socket.user_logged()) {
			socket.emit('error', { message: "You are not logged in.", code: action_code });
			socket.emit('logged_out');
			return;
		}
		var user = socket.user;
		if (socket.user.room == null) {
			socket.emit('error', { message: "You are not in a room.", code: action_code });
			socket.emit('logged_in', { user: socket.user, update: false });
			return;
		}
		var room = socket.context.rooms[user.room];
		if (room.leader != user.id) {
			socket.emit('error', { message: "You are not the room leader.", code: action_code });
			return;
		}

		room.start_game(socket);
		socket.emit('success', {"message": "Successfully started game", "code": action_code});		
	});
};

module.exports.start_game = start_game;