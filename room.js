var check        = require('validator').check,
	sanitize     = require('validator').sanitize,
	functions    = require('./functions'),
	update_rooms = require('./update_rooms').update_rooms,
	random_token = functions.random_token;
	room_id      = 0;

shuffle = function(o){ //v1.0
	for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
	return o;
};

function Room(name, rounds, max_players, stop_time, check_time, interval_time, letters, categories, user) {
	this.id = room_id++;
	this.status = 0;
	this.leader = user.id;
	this.users = {};
	this.name = name;
	this.rounds = rounds;
	this.current_round = 0;
	this.max_players = max_players;
	this.stop_time = stop_time;
	this.letters = letters;
	this.check_time = check_time;
	this.interval_time = interval_time;
	this.categories = [];
	for (var i = 0; i < categories.length; i++) {
		var category = sanitize(categories[i]).trim();
		if (category != "") {
			this.categories.push(category);
		}
	}

	this.users[user.id] = 0;
	this.time = 0;
	this.order = shuffle(this.letters);
	this.game = {
		status: 0
	};
	this.words = {};
	this.stop_response = [];
	this.stopped = false;
	this.points = {};
	this.points_users = {};
	this.current_category = 0;
	this.ready_users = [];
	this.timer_interval = setInterval(function (){ return false; }, 500);

};


Room.prototype.is_valid = function() {
	try {
		check(this.name, "Invalid name. The name should be Alphanumeric, containing a maximum of 25 caracters").is(/^[a-zAA-Z '`_-]+$/).len(1, 25);
		check(this.rounds, "Invalid rounds count. The number of rounds should be numeric, containing a maximum of selected letters").isNumeric().min(1).max(this.letters.length);
		check(this.max_players, "Invalid players count. The number of players should be a number greater or equals to 0").isNumeric().min(0);
		check(this.stop_time, "Invalid stop time. The stop time should be a number greater or equals to 0").isNumeric().min(0);
		check(this.check_time, "Invalid check time. The check time should be a number greater or equals to 5").isNumeric().min(5);
		check(this.interval_time, "Invalid interval time. The interval time should be a number greater or equals to 5").isNumeric().min(5);
		check(this.letters.length, "Invalid letters number. You should select at least one letter").isNumeric().min(1);
		check(this.categories.length, "Invalid categories number. You should write at least one category").isNumeric().min(1);
		return { valid: true };
	} catch (err) {
		return { 
			valid: false,
			message: err.message
		};
	}
};


Room.prototype.get_info = function(context) {
	var list = {
		id: this.id,
		name: this.name,
		game: this.game,
		rounds: this.rounds,
		current_round: this.current_round,
		max_players: this.max_players,
		stop_time: this.stop_time,
		check_time: this.check_time,
		categories: this.categories,
		users: {},
		user_count: this.user_count()
	}
	for (var i in this.users) {
		var user = context.users[i];
		list.users[user.id] = {
			id: user.id,
			nickname: user.nickname,
			score: this.users[i],
			leader: (user.id == this.leader)
		}; 
	}
	return list;
};

Room.prototype.user_count = function() {
	var c = 0;
	for (var e in this.users) {
		c++;
	}
	return c;
};

Room.prototype.get_different_user = function(user_id) {
	for (var e in this.users) {
		if (e != user_id) {
			return e;
		}
	}
	return -1;
};

Room.prototype.disconnect_user = function(socket, user_id) {
	this.remove_words(user_id);
	var user = socket.context.users[user_id];
	var next_leader = this.leader;
	if (this.leader == user_id) {
		next_leader = this.get_different_user(user_id);
	}
	user.room = null;
	if (next_leader == -1) {
		delete socket.context.rooms[this.id];
		update_rooms(socket, true, true);
		return;
	} 
	delete this.users[user_id];
	this.leader = next_leader;
	update_rooms(socket, true, true);
	this.room_update(socket, false, true, false, false);
};

Room.prototype.join_user = function(socket, user_id) {
	this.users[user_id] = 0;
	update_rooms(socket, false, true);
	this.room_update(socket, true, true, true, false);
	if (this.stopped) {
		this.stop_response.push(user_id);
	}
};

Room.prototype.room_update = function(socket, to_user, to_room, update_user, update_room) {
	if (to_user) {
		socket.emit('room_update', { room: this.get_info(socket.context), update: update_user });
	}
	if (to_room) {
		socket.broadcast.to("room"+this.id).emit('room_update', { room: this.get_info(socket.context), update: update_room });
	}
};

Room.prototype.start_game = function(socket) {
	clearInterval(this.timer_interval);
	this.timer_interval = setInterval(function (){ return false; }, 500);

	this.monitor = true;
	this.words = {};
	this.points = {};
	this.points_users = {};
	this.stopped = false;
	this.game = {
		status: 1,
		letter: this.order[this.current_round],
		time: this.stop_time,
		timer: (new Date).getTime()
	};

	this.room_update(socket, true, true, true, true);
};

Room.prototype.remove_words = function(user_id) {
	for (var cat_i in this.words) {
		var words = this.words[cat_i];
		for (var word_i in words) {
			var users = words[word_i];
			var new_users = []
			for (var user_i in users) {
				var user = users[user_i];
				if (user != user_id) {
					new_users.push(user);
				}
			}
			if (new_users == []) {
				delete this.words[cat_i][word_i];
			} else {
				this.words[cat_i][word_i] = new_users;	
			}
			
		}
	}
};

Room.prototype.add_categories = function(data, user_id) {
	this.remove_words(user_id);

	var result = true;
	for (var category_index in this.categories) {
		var category = this.categories[category_index];
		if (this.words[category] == undefined) {
			this.words[category] = {};
		}
		var word = data[category]; 

		if (word != undefined && word != "") {
			if (this.words[category][word] == undefined) {
				this.words[category][word] = [];
			}
			this.words[category][word].push(user_id);
		} else {
			result = false;
		}		
	}
	return result;
};

Room.prototype.start_checking = function(socket, user_id) {
	this.stopped = true;
	this.stop_response = [];
	socket.emit('stop_request');
	socket.broadcast.to("room"+this.id).emit('stop_request');
};

Room.prototype.all_stopped = function() {
	var c = 0;
	for (var index in this.stop_response) {
		var user = this.stop_response[index];
		if (this.users[user] != undefined) {
			c++;	
		} 
	}
	return (c == this.user_count());
};

Room.prototype.continue_pre_checking = function(socket, user_id) {
	var room = this;
	this.stop_response.push(user_id);
	if (this.all_stopped()) {
		this.current_category = 0;
		this.stopped = false;
		this.game = {
			status: 2,
			letter: this.order[this.current_round],
			category: this.categories[this.current_category],
			words: this.words[this.categories[this.current_category]],
			time: this.check_time,
			timer: (new Date).getTime()
		};
		clearInterval(this.timer_interval);
		this.timer_interval = setInterval(function (){
			var time = (room.game.time - Math.floor(((new Date).getTime() - room.game.timer)/1000));
			if (time <= 0 && !room.stopped) {
				room.next_checking(socket);
			}
		}, 500);
		this.room_update(socket, true, true, true, true);
	}
};

Room.prototype.calculate_scores = function() {
	for (var cat_i in this.words) {
		var words = this.words[cat_i];
		var players = this.points_users[cat_i];
		for (var word_i in words) {
			var users = words[word_i];
			var count = this.points[cat_i][word_i];
			if (count*1.0 / players*1.0 > 0.5) {
				if (users.length == 1) {
					this.users[users[0]] += 10;
				} else {
					for (var user_i in users) {
						this.users[users[user_i]] += 5;
					}
				}
			}
			
		}
	}
};

Room.prototype.continue_checking = function(socket, user_id) {
	var room = this;
	this.stop_response.push(user_id);
	if (this.all_stopped()) {
		this.stopped = false;
		this.current_category++;
		if (this.current_category < this.categories.length) {
			this.ready_users = [];
			this.game = {
				status: 2,
				letter: this.order[this.current_round],
				category: this.categories[this.current_category],
				words: this.words[this.categories[this.current_category]],
				time: this.check_time,
				timer: (new Date).getTime()
			};
			clearInterval(this.timer_interval);
			this.timer_interval = setInterval(function (){
				var time = (room.game.time - Math.floor(((new Date).getTime() - room.game.timer)/1000));
				if (time <= 0 && !room.stopped) {
					room.next_checking(socket);
				}
			}, 500);
		} else {
			this.ready_users = [];
			this.current_round++;
			socket.emit('debug', {words: this.words, points: this.points, players: this.points_users, users: this.users});
			this.calculate_scores();
			socket.emit('debug', {words: this.words, points: this.points, players: this.points_users, users: this.users});
			if (this.current_round < this.rounds) {
				this.game = {
					status: 3,
					time: this.interval_time / 1,
					timer: (new Date).getTime()
				};	
				clearInterval(this.timer_interval);
				this.timer_interval = setInterval(function (){
					var time = (room.game.time - Math.floor(((new Date).getTime() - room.game.timer)/1000));
					if (time <= 0 && !room.stopped) {
						room.start_game(socket);
					}
				}, 500);	
			} else {
				clearInterval(this.timer_interval);
				this.timer_interval = setInterval(function (){ return false; }, 500);
				this.game = {
					status: 4
				}
			}
				
		}

		this.room_update(socket, true, true, true, true);
	}
};

Room.prototype.next_checking = function(socket) {
	this.stopped = true;
	this.stop_response = [];
	this.ready_users = [];
	socket.emit('check_request');
	socket.broadcast.to("room"+this.id).emit('check_request');
};

Room.prototype.check_words = function(data, user_id) {
	if (this.stop_response.indexOf(user_id) == -1) {
		var cat = this.categories[this.current_category];
		var words = this.words[cat];
		if (this.points_users[cat] == undefined) {
			this.points_users[cat] = 0;
		}
		this.points_users[cat]++;
		
		for (var word in words) {
			if (this.points[cat] == undefined) {
				this.points[cat] = {};	
			}
			if (this.points[cat][word] == undefined) {
				this.points[cat][word] = 0;
			}
			if (data[word] != undefined && data[word] != "") {
				this.points[cat][word]++;
			}
		}	
	}
};

Room.prototype.all_ready = function() {
	var c = 0;
	for (var index in this.ready_users) {
		var user = this.ready_users[index];
		if (this.users[user] != undefined) {
			c++;	
		} 
	}
	return (c == this.user_count());
};


module.exports.Room = Room;