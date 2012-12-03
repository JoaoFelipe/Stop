var check        = require('validator').check,
	functions    = require('./functions'),
	random_token = functions.random_token;
	user_id      = 0;

function User() {
	this.id = user_id++;
	this.is_logged = false;
	this.nickname = "";
	this.token = "";
	this.room = null;
};


User.prototype.is_valid = function() {
	try {
		check(this.nickname, "Invalid nickname. The nickname should be Alphanumeric, containing between 3 and 20 caracters").isAlphanumeric().len(3,20);
		return { valid: true };
	} catch (err) {
		return { 
			valid: false,
			message: err.message
		};
	}
};

User.prototype.set_nickname = function(nickname) {
	this.nickname = nickname;
};

User.prototype.set_logged = function(logged) {
	this.is_logged = logged;
};

User.prototype.generate_token = function() {
	this.token = random_token();
};



module.exports.User = User;