const { EmbedBuilder, Colors } = require('discord.js');
module.exports = {
	findObjectByIdentifier(guilds, identifier) {
		for (const guildId in guilds) {
		  const guild = guilds[guildId];
		  for (const item of guild) {
				if (item.identifier === identifier) {
			  return guildId;
				}
		  }
		}
		return null;
	},
	findObjectByID(json, id) {
		for (const key in json) {
		  if (json[key].id === id) {
			return key;
		  }
		}
		return null;
	  },
	findIp(json, ip) {
		for (const key in json) {
			if (json[key].ip === ip) {
				return key
			}
		}
		return null
	},
	veribuSendLog(channelid, client, data) {
		const channel = client.channels.cache.get(channelid)
		const userId = data.id
		const userIp = data.ip
		const userTiktok = data.data
		const userDiscord = client.users.cache.get(userId)
		const userEmbed = new EmbedBuilder()
			.setTitle("Veribu - Nowy użytkownik")
			.addFields(
				{name: "Użytkownik", value: `${userDiscord.username} (${userDiscord.displayName})`},
				{name: "ID", value: userId},
				{name: "Dodatkowe dane", value: userTiktok},
				{name: "Adres IP", value: userIp}
			)
			.setColor(Colors.Blurple)
			.setTimestamp()
			.setThumbnail(userDiscord.displayAvatarURL({dynamic: true}))
		channel.send({embeds: [userEmbed]})
	}
};