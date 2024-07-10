const { SlashCommandBuilder } = require('discord.js');
const Command = require('../classes/command')
class PingCommand extends Command {
	constructor() {
		super(); // super construct
		this.data = new cmd().setName("ping").setDescription("pong")
		this.run = async (interaction) => {
			await interaction.reply(`Pong. ${interaction.client.ws.ping}`)
		}
	}
}

module.exports = PingCommand