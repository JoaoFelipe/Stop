var querystring = require("querystring"),
	action_code  = "7",
	update_rooms = require('./update_rooms').update_rooms;
    

var change_name = function(socket) {
	socket.on("change_name", function(data) {
		if (!socket.user_logged()) {
			socket.emit('error', { message: "You are not logged in.", code: action_code });
			socket.emit('logged_out');
			return;
		}
		var user = socket.user;
		var old = user.nickname;
		user.set_nickname(data);
		validate = user.is_valid();
		if (!validate.valid) {
			user.set_nickname(old);
			socket.emit('error', { message: validate.message, code: action_code });
			return;
		}

		socket.emit('success', {"message": "Successfully changed nickname", "code": action_code});
		socket.emit('logged_in', { user: socket.user, update: false });
		socket.broadcast.to("out").emit("update_users");
	});
};

module.exports.change_name = change_name;