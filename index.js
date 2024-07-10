const fs = require('fs');
const { Client, Collection, IntentsBitField:Intents, SlashCommandBuilder } = require('discord.js');
const { discord } = require('./config.json')
// define my scripts
const envHandler = require('./classes/envHandler');
const commandHandler = require('./classes/command');
const client = new Client({
	intents: [
		Intents.Flags.Guilds,
		Intents.Flags.GuildMembers,
		Intents.Flags.GuildMessages,
		Intents.Flags.MessageContent
	]
})
const options =  {deploy: true, client: client}
// globals
client.commands = new Collection();
globalThis.cmd = SlashCommandBuilder
globalThis.djsClient = client
globalThis.temporaryUserData = new Collection();
// handle allat
require('./backend/web')
const handler = new commandHandler('./commands')
handler.handle(options)
// handle events
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}
// anti crash
process.on("unhandledRejection", (reason, p) => {
    console.log("[antiCrash] :: Unhandled Rejection/Catch");
    console.log(reason, p);
});
process.on("uncaughtException", (err, origin) => {
    console.log("[antiCrash] :: Uncaught Exception/Catch");
    console.log(err, origin);
});
process.on("uncaughtExceptionMonitor", (err, origin) => {
    console.log("[antiCrash] :: Uncaught Exception/Catch (MONITOR)");
    console.log(err, origin);
});

client.once('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
})
client.login(discord.token)