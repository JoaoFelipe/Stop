var action_code  = "9",
	Room         = require('./room').Room,
	update_rooms = require('./update_rooms').update_rooms;
   

var stop_response = function(socket) {
	socket.on("stop_response", function(data) {
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
		room.add_categories(data, user.id);
		room.continue_pre_checking(socket, user.id);
		socket.emit('success', {"message": "Successfully sent stop response", "code": action_code});		
	});
};

module.exports.stop_response = stop_response;