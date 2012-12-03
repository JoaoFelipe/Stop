var action_code = "1";
    

var chat_inside = function(socket) {
	socket.on("chat_inside", function(data) {
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
		socket.broadcast.to("room"+user.room).emit("chat_inside", message);
		socket.emit("chat_inside", message);
	});
};

module.exports.chat_inside = chat_inside;