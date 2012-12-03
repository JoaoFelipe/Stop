var action_code  = "9",
	Room         = require('./room').Room,
	ready        = require('./ready').ready;
   

var ready = function(socket) {
	socket.on("ready", function(data) {
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
		if (room.ready_users.indexOf(user.id) == -1) {
			room.ready_users.push(user.id);
			if (room.all_ready()) {
				if (room.game.status == 2 && !room.stopped) {
					room.next_checking(socket);
				}
				if (room.game.status == 3 && !room.stopped) {
					room.start_game(socket);
				}
			}
			
		}

		socket.emit('success', {"message": "Successfully sent ready", "code": action_code});		
	});
};

module.exports.ready = ready;