function Context() {
	this.sessions = {}
	this.users = {};
	this.rooms = {};
	this.room_id = 0;
	this.user_id = 0;

	this.current_user = null;

	this.create_session = ContextCreateSession
};

function ContextCreateSession(session_id) {
	if (this.sessions[session_id] == undefined) {
        this.current_user = {
        	id: this.user_id++,
        	is_logged: false
        }
        this.sessions[session_id] = this.current_user;
    } else {
        this.current_user = this.sessions[session_id];
    }
};

module.exports.Context = Context;