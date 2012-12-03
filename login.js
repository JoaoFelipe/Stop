var querystring = require("querystring"),
	action_code  = "7",
	update_rooms = require('./update_rooms').update_rooms;
    

var login = function(socket) {
	socket.on("login", function(data) {
		data = querystring.parse(data);
		if (socket.user_logged()) {
			socket.emit('error', { message: "You are already logged in.", code: action_code });
			socket.emit('logged_in', { user: socket.context.current_user, update: false });
			return;
		}
		var user = socket.user;
		var old = user.nickname;
		user.set_nickname(data.nickname);
		validate = user.is_valid();
		if (!validate.valid) {
			user.set_nickname(old);
			socket.emit('error', { message: validate.message, code: action_code });
			return;
		}

		user.set_logged(true);
		user.generate_token();
		socket.join("user" + user.id);
		socket.join("out");
		socket.emit('success', {"message": "Successfully logged in", "code": action_code});
		socket.emit('logged_in', { user: socket.user, update: true });
		socket.broadcast.to("out").emit("update_users");
		update_rooms(socket, true, false);
	});
};

module.exports.login = login;