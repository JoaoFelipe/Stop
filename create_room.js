var action_code  = "2",
	Room         = require('./room').Room,
	update_rooms = require('./update_rooms').update_rooms;
   

var create_room = function(socket) {
	socket.on("create_room", function(data) {
		if (!socket.user_logged()) {
			socket.emit('error', { message: "You are not logged in.", code: action_code });
			socket.emit('logged_out');
			return;
		}
		var user = socket.user;
		var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		var letters = [];
		for (var index in alphabet) {
			if (data[alphabet[index]] == 'on') {
				letters.push(alphabet[index]);
			}
		}
		var categories = data.categories.split(/\s/);
		var room = new Room(data.name, data.rounds, data.players, data.stop, data.check, letters, categories, user);

		var validate = room.is_valid();
		if (!validate.valid) {
			socket.emit('error', { message: validate.message, code: action_code });
			return;
		}

		if (user.room != null) {
			socket.context.rooms[user.room].disconnect_user(socket, user.id);
		}

		socket.context.rooms[room.id] = room;
		user.room = room.id;
		socket.join("room" + room.id);
		socket.emit('success', {"message": "Successfully created room", "code": action_code});
		room.room_update(socket, true, false, true, false);
		update_rooms(socket, false, true);
		socket.leave('out');
		
	});
};

module.exports.create_room = create_room;