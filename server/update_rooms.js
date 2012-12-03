var action_code = "10";
    

var update_rooms = function(socket, to_user, to_out) {
	var temp_rooms = socket.context.rooms;
	var rooms = [];
	for (var room in temp_rooms) {
		rooms.push(temp_rooms[room].get_info(socket.context));
	}
	if (to_user) {
		socket.emit('update_rooms', {rooms: rooms});	
	}
	if (to_out) {
		socket.broadcast.to("out").emit('update_rooms', {rooms: rooms});
	}
};


var request_update_rooms = function(socket) {
	socket.on("request_update_rooms", function(data) {
		if (!socket.user_logged()) {
			socket.emit('error', { message: "You are not logged in.", code: action_code });
			socket.emit('logged_out');
			return;
		}
		update_rooms(socket, true, false);
	});
};

module.exports.update_rooms = update_rooms;
module.exports.request_update_rooms = request_update_rooms;
