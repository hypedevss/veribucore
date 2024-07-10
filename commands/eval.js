const Command = require('../classes/command')
const { discord } = require('../config.json')
class EvalCommand extends Command {
	constructor() {
		super();
		this.data = new cmd().setName("eval").setDescription("uruchamia kod js").addStringOption(option => option.setName("kod").setDescription("kod do uruchomienia").setRequired(true))
		this.run = async (interaction) => {
			// check owner
			if (interaction.user.id != discord.ownerId) return interaction.reply({content: "nah", ephemeral: true})
			const code = interaction.options.getString("kod")
			try {
				const evaled = require('util').inspect(eval(code))
				await interaction.reply({content: `\`\`\`js\n${evaled}\`\`\``, ephemeral: true})
			} catch (error) {
				await interaction.reply({content: `\`\`\`js\n${require('util').inspect(error)}\`\`\``, ephemeral: true})
			}
		}
	}
}

module.exports = EvalCommand