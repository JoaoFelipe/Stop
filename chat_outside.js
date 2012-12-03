var action_code = "1";
    

var chat_outside = function(socket) {
	socket.on("chat_outside", function(data) {
		if (!socket.user_logged()) {
			socket.emit('error', { message: "You are not logged in.", code: action_code });
			socket.emit('logged_out');
			return;
		}
		var user = socket.user,
		nickname = user.nickname;
		if (data == "") {
			return;
		}
		var message = nickname + ": " + data;
		socket.broadcast.to("out").emit("chat_outside", message);
		socket.emit("chat_outside", message);
	});
};

module.exports.chat_outside = chat_outside;