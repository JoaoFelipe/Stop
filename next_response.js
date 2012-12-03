var action_code  = "11",
	Room         = require('./room').Room,
	update_rooms = require('./update_rooms').update_rooms;
   

var next_response = function(socket) {
	socket.on("next_response", function(data) {
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
		room.check_words(data);
		room.continue_checking(socket, user.id);
		socket.emit('success', {"message": "Successfully sent stop response", "code": action_code});		
	});
};

module.exports.next_response = next_response;