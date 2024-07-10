const fs = require('fs');
const { discord } = require('../config.json')
const { REST, Routes } = require('discord.js');
class Command {
	constructor(path, options) {
		this.path = path; // path to a directory
		this.options = options // options object
		// console.log(options)
		// handle commands 
		this.handle = async (flags) => {
			const commandFiles = fs.readdirSync(this.path).filter(file => file.endsWith('.js'));
			for (const file of commandFiles) {
				const command = require(`.${this.path}/${file}`);
				const constructCommand = new command() // { "data": new SlashCommandBuilder(), "run": function run()}
				flags.client.commands.set(constructCommand.data.name, {data: constructCommand.data, run: constructCommand.run});
			}
			// deploy commands
			if (flags.deploy) {
				const rest = new REST({ version: '10' }).setToken(discord.token);
				const commandData = flags.client.commands.map(command => command.data.toJSON())
				rest.put(Routes.applicationGuildCommands(discord.clientId, discord.guildId), { body: commandData })
				console.log(`Registered application commands.`)
			}
				
		}
	}
}

module.exports = Command