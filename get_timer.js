var action_code  = "5",
	Room         = require('./room').Room,
	update_rooms = require('./update_rooms').update_rooms;
   

var get_timer = function(socket) {
	socket.on("get_timer", function(data) {
		if (!socket.user_logged()) {
			socket.emit("delete_timer_interval");
			return;
		}
		var user = socket.user;
		if (socket.user.room == null) {
			socket.emit("delete_timer_interval");
			return;
		}
		var room = socket.context.rooms[user.room];
		var category = room.current_category;
		var time = (room.game.time - Math.floor(((new Date).getTime() - room.game.timer)/1000));
		
		if(time > 0) {
			socket.emit("update_timer", time);
		} else {
			socket.emit("update_timer", 0);
		}	
	});
};

module.exports.get_timer = get_timer;