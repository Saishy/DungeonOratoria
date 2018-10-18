process.send = process.send || function () {};

const fs = require('fs');
const Discord = require('discord.js');

// bot configuration
const { prefix } = require('./config.json');

const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands');

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

const events = process.env.EVENTS ? require('./methods/events.js') : false;

// when the client is ready, run this code
// this event will trigger whenever your bot:
// - finishes logging in
// - reconnects after disconnecting
client.on('ready', () => {
	if (process.env.EVENTS) {
		events.initialize(client);
	}
	process.send('ready');
	client.user.setUsername(process.env.NICKNAME);
	console.log('Ready!');
});

client.on('message', message => {
	const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|\\${prefix})\\s*`);
	if (!prefixRegex.test(message.content) || message.author.bot) return;

	//if (!message.content.startsWith(prefix) || message.author.bot) return;

	//const re = /\s(?!(resistance))/g;
	//const readMsg = message.content.slice(prefix.length).replace('resistance', 'resist').replace(' resist', 'resist').replace(' rate', 'rate').replace(' attack', 'attack').replace('null ', 'null');
	const [, matchedPrefix] = message.content.match(prefixRegex);
	const args = message.content.slice(matchedPrefix.length).trim().split(/\s+/);
	const commandName = args.shift();

	//console.log(`message.content: ${message.content}`);
	//console.log(`command: ${commandName}`);
	//console.log(`args: ${args}`);

	const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;

	if (command.name === 'event' && !process.env.EVENTS) {
		return;
	}
	
	if (command.guildOnly && message.channel.type !== 'text') {
		return message.reply('I can\'t execute that command inside DMs!');
	}

	if (command.args && !args.length) {
		//return message.channel.send(`You didn't provide any arguments, ${message.author}!`);
		let reply = `You didn't provide any arguments, ${message.author}!`;

		if (command.usage) {
			reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
		}

		return message.channel.send(reply);
	}

	try {
		command.execute(message, args);
	} catch (error) {
		console.error(error);
		message.reply('There was an error trying to execute that command!');
	}
});

process.on('unhandledRejection', error => console.error(`Uncaught Promise Rejection:\n${error}`));

process.on('SIGINT', function() {
	if (process.env.EVENTS) {
		events.quit();
	}
	process.exit();
});

// login to Discord with your app's token
client.login(process.env.TOKEN)
	.then(function(returnString) {
	});