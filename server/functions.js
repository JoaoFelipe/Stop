function random_token() {
	var chars = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890";
	var rand = function() {
		return Math.floor(Math.random()*chars.length);
	}
	var token = "";
	for (var counter = 0; counter <= 35; counter++) {
		token += chars[rand()];
	}
	return token;
};

module.exports.random_token = random_token;