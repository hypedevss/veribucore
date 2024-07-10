module.exports = {
	name: 'interactionCreate',
	/**
	 * 
	 * @param {import("discord.js").Interaction} interaction 
	 * @returns 
	 */
	async execute(interaction) {
		if (!interaction.isCommand()) return;

		const cmd = interaction.client.commands.get(interaction.commandName);
		if (!cmd) return;
		try {
			// now run allat (somehow)
			await cmd.run(interaction);
		} catch (error) {
			console.error(error);
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
}