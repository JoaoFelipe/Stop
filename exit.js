var action_code = "3";
    

var exit = function(socket) {
	socket.on("exit", function(data) {
		if (!socket.user_logged()) {
			socket.emit('error', { message: "You are not logged in.", code: action_code });
			socket.emit('logged_out');
			return;
		}
		var user = socket.user;
		if (user.room != null) {
			var room = socket.context.rooms[user.room];
			room.disconnect_user(socket, user.id);
			socket.leave('room' + room.id);
		} else {
			socket.leave("out");
		}
		user.set_nickname('');
		user.set_logged(false);
		socket.leave("user" + user.id);
		socket.emit('success', {"message": "Successfully logged out", "code": action_code});
		socket.emit('logged_out');
		socket.broadcast.to("out").emit("update_users");

	});
};

module.exports.exit = exit;