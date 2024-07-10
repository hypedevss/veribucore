const nl = require('nope.db-nl')
module.exports = {
	name: "guildMemberRemove", 
	async execute(member) {
		if (member.user.bot) return;
		const veribudb = new nl({path: './database/veribu.json'})
		// check if the user is in the db
		if (!veribudb.has(member.user.id)) return;
		// rest
		const userdata = veribudb.get(member.user.id)
		// add reverify to the user
		userdata.reverify = true
		veribudb.set(member.user.id, userdata)
		// say goodbye (not really)
	}
}