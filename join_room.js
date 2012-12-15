var action_code  = "6",
	Room         = require('./room').Room,
	update_rooms = require('./update_rooms').update_rooms;
   

var join_room = function(socket) {
	socket.on("join_room", function(data) {
		if (!socket.user_logged()) {
			socket.emit('error', { message: "You are not logged in.", code: action_code });
			socket.emit('logged_out');
			return;
		}
		var user = socket.user;
		var room = null;
		room = socket.context.rooms[data.id]; 
		if (room == undefined) {	
			socket.emit('error', { message: "Room not found", code: action_code });
			return;
		}
		if (room.max_players == 0 || room.max_players > room.user_count()) {
			if (user.room != null) {
				socket.context.rooms[user.room].disconnect_user(socket, user.id);
			}
			room.join_user(socket, user.id);
			user.room = room.id;
			socket.join("room" + room.id);
			socket.emit('success', {"message": "Successfully joined in room", "code": action_code});
			socket.leave('out');
			var message = user.nickname + " joined the room";
			socket.broadcast.to("room"+user.room).emit("chat_inside", message);
			socket.emit("chat_inside", message);
		} else {
			socket.emit('error', { message: "Room is full", code: action_code });
			return;
		}
	});
};

module.exports.join_room = join_room;