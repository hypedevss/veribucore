const { PermissionsBitField, EmbedBuilder, Colors } = require('discord.js');
const Command = require('../classes/command')
const { discord, oauth } = require('../config.json')
const nl = require('nope.db-nl')
const utils = require('../modules/utils')
class VeribuCommand extends Command {
	constructor() {
		super();
		this.data = new cmd()
			.setName("veribu")
			.setDescription("-")
			.setDefaultMemberPermissions(PermissionsBitField.Flags.ManageRoles)
			.addSubcommand(sc => sc.setName("lookup").setDescription("Wyszukuje użytkownika").addUserOption(o => o.setName("user").setDescription("Oznacz użytkownika którego chcesz wyszukać"))/*.addStringOption(o => o.setName("tiktok").setDescription("Nazwa użytkownika na TikTok"))*/)
			.addSubcommand(sc => sc.setName("block").setDescription("Blokuje IP Użytkownika").addStringOption(o => o.setName("ip").setDescription("Adres IP uzytkownika").setRequired(true)))
			.addSubcommand(sc => sc.setName("unblock").setDescription("Odblokowuje IP Użytkownika").addStringOption(o => o.setName("ip").setDescription("Adres IP uzytkownika").setRequired(true)))
			.addSubcommand(sc => sc.setName("blocklist").setDescription("Pokazuje zablokowane IP"))
			.addSubcommand(sc => sc.setName("dataremoval").setDescription("Usuwa dane użytkownika").addStringOption(o => o.setName("id").setDescription("discord id").setRequired(true)))
		this.run = async (interaction) => {
			const db = new nl({path: './database/veribu.json'})
			if (interaction.options.getSubcommand() === "lookup") {
				const lookupEmbed = new EmbedBuilder()	
					.setTitle("Wyszukany użytkownik")
					.setColor(Colors.Blurple)
					.setTimestamp()	
				const user = interaction.options.getUser("user")
				const tiktokUser = interaction.options.getString("tiktok")
				if (user && tiktokUser) return interaction.reply({content: "Szukasz albo tym albo tym.", ephemeral: true})
				if (!user && !tiktokUser) return interaction.reply({content: "Jak ty chcesz szukać bez argumentów", ephemeral: true})
				if (tiktokUser) {
					const result = db.get(tiktokUser)
					if (result) {
						const fetchUser = interaction.guild.members.cache.get(result.id).user
						lookupEmbed.setAuthor({name: fetchUser.username})
						lookupEmbed.setDescription(`ID Użytkownika: ${result.id}\nAdres IP: ${result.ip}\nDodatkowe dane: ${result.additional}`)
						lookupEmbed.setThumbnail(fetchUser.displayAvatarURL({dynamic: true}))
						interaction.reply({embeds: [lookupEmbed], ephemeral: true})
					} else {
						interaction.reply({content: `Nie znaleziono uzytkownika w bazie danych.`, ephemeral: true})
					}
				} else {
					const getResultName = user.id
					if (getResultName) {
						const result = db.get(getResultName)
						const fetchUser = interaction.guild.members.cache.get(result.id).user
						lookupEmbed.setAuthor({name: fetchUser.username})
						lookupEmbed.setDescription(`ID Użytkownika: ${result.id}\nAdres IP: ${result.ip}\nDodatkowe dane: ${result.additional}`)
						lookupEmbed.setThumbnail(fetchUser.displayAvatarURL({dynamic: true}))
						interaction.reply({embeds: [lookupEmbed], ephemeral: true})
					} else {
						interaction.reply({content: `Nie znaleziono uzytkownika w bazie danych.`, ephemeral: true})
					}
				}
			} else if (interaction.options.getSubcommand() === "test") {
				// only for owner
				if (interaction.user.id != discord.ownerId) return interaction.reply({content: "nah", ephemeral: true})
				const id = interaction.options.getString("id")
				const ip = interaction.options.getString("ip")
				const tiktok = interaction.options.getString("tiktok")
				db.set(tiktok, {id: id, ip: ip, tiktok: tiktok})
				interaction.reply({content: `Utworzono nowe dane.`})
			
		} else if (interaction.options.getSubcommand() === "block") {
			const ip = interaction.options.getString("ip")
			// check if ip is already blocked
			if (db.get("blockedIps").includes(ip)) return interaction.reply({content: `Adres ${ip} jest juz zablokowany.`, ephemeral: true})
			db.push("blockedIps", ip)
			interaction.reply({content: `Zablokowano IP: ${ip}`, ephemeral: true})
		} else if (interaction.options.getSubcommand() === "unblock") {
			const ip = interaction.options.getString("ip")
			// check if ip is not blocked
			if (!db.get("blockedIps").includes(ip)) return interaction.reply({content: `Adres ${ip} nie jest zablokowany.`, ephemeral: true})
			const ipindex = db.get("blockedIps").indexOf(ip)
			db.splice("blockedIps", ipindex)
			interaction.reply({content: `Odblokowano IP: ${ip}`, ephemeral: true})
		} else if (interaction.options.getSubcommand() === "blocklist") {
			const blockedIps = db.get("blockedIps")
			var blockedlist = blockedIps.map(ip => `- ${ip}`)
			// if theres no blocked ips
			if (blockedlist.length === 0) {
				blockedlist = "Nie ma żadnych zablokowanych adresów IP"
			}
			var descContent;
			if (typeof blockedlist === "string") {
				descContent = blockedlist
			} else {
				descContent = blockedlist.join("\n")
			}
			const embed = new EmbedBuilder()
				.setTitle("Lista zablokowanych IP")
				.setDescription(descContent)
				.setColor(Colors.Blurple)
				.setTimestamp()
			interaction.reply({embeds: [embed], ephemeral: true})
		} else if (interaction.options.getSubcommand() === "dataremoval") {
			// onlyowner
			if (interaction.user.id != discord.ownerId) return interaction.reply({content: "nah", ephemeral: true})
			const id = interaction.options.getString("id")
			if (!db.has(id)) return interaction.reply({content: `Nie znaleziono uzytkownika w bazie danych.`, ephemeral: true})
			db.delete(id)
			try {
			await interaction.guild.members.cache.get(id).roles.remove(oauth.discord.role)
			} catch (err) {
				// nothing
			}
			interaction.reply({content: `Dane użytkownika i rola została usunięta.`, ephemeral: true })
		}
		// this.ack(this)
	}
}
}

module.exports = VeribuCommand