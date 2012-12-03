var action_code  = "4",
	update_rooms = require('./update_rooms').update_rooms;
    

var exit_room = function(socket) {
	socket.on("exit_room", function(data) {
		if (!socket.user_logged()) {
			socket.emit('error', { message: "You are not logged in.", code: action_code });
			socket.emit('logged_out');
			return;
		}
		if (socket.user.room == null) {
			socket.emit('error', { message: "You are not in a room.", code: action_code });
			socket.emit('logged_in', { user: socket.user, update: false });
			return;
		}
		var user = socket.user;
		var room = socket.context.rooms[user.room];
		socket.leave('room' + room.id);
		socket.join("out");
		room.disconnect_user(socket, user.id);
		socket.emit('success', {"message": "Successfully quit room", "code": action_code});
		socket.emit('exit_room');
		socket.broadcast.to("out").emit("update_users");

	});
};

module.exports.exit_room = exit_room;