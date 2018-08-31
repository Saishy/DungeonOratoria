const { prefix } = require('../config.json');
const events = require('../methods/events.js');

const functions = {
	mergeBetweenDoubleQuotes: function(arguments) {
		//console.log(arguments.length);
		let bBreak = false;

		for (let i = 0; i < arguments.length; i++) {
			//console.log(arguments[i]);
			//console.log(i);
			if (arguments[i].slice(0, 1) === '\"') {
				bBreak = false;

				let x = i + 1;
				while (x < arguments.length) {
					arguments[i] += ` ${arguments[x]}`;

					if (arguments[x].slice(-1) === '\"') {
						bBreak = true;
					}

					arguments.splice(x, 1);

					if (bBreak) {
						arguments[i] = arguments[i].substring(1, arguments[i].length-1);
						break;
					}
				}
			}
		}

		return arguments;
	},

	checkIfDateIsValidAndReturn: function(dateString) {
		const newDate = Date.parse(dateString);

		if (isNaN(newDate)) {
			return null;
		}

		if ((newDate - new Date()) <= 60000) {
			return -1;
		}

		return newDate;
	}
};

module.exports = {
	name: 'event',
	description: 'Adds, removes and subscribes to danmemo events.',
	aliases: ['events'],
	usage: 'list/ mylist/ subscribe {id}/ unsubscribe {id}/ add/ remove {id}/ edit {id}',
	example: prefix + 'event add "event name here" "25 Dec 2777 00:00:00 GMT" "(optional) event description"\n' +
	prefix + 'event edit {id} "event name here" "25 Dec 2777 00:00:00 GMT" "(optional) event description"\n' +
	'***The double quotes are required.***',
	guildOnly: true,
	cooldown: 5,
	execute(message, args) {
		let messageString = '';
		let firstArg = args[0] ? args[0].toLowerCase() : undefined;

		args = functions.mergeBetweenDoubleQuotes(args);

		console.log(`Event: ${args}`);

		if (!args.length) {
			messageString = 'You must specify one of the following: list/subscribe';

			if (message.member.hasPermission('MANAGE_MESSAGES', false, true, true)) {
				messageString += '/add/remove/edit';
			}
		} else {
			if (message.member.hasPermission('MANAGE_MESSAGES', false, true, true)) {
				if (firstArg === undefined || !['list', 'mylist', 'subscribe', 'unsubscribe', 'add', 'remove', 'edit'].includes(firstArg)) {
					return message.reply('that\'s not a valid command!');
				}
			} else {
				if (firstArg === undefined || !['list', 'mylist', 'subscribe', 'unsubscribe'].includes(firstArg)) {
					return message.reply('that\'s not a valid command!');
				}
			}

			let pastDate, newDate, newEventId, eventList;

			switch(firstArg) {
				case 'mylist':
					eventList = events.listEventsByServerAndUser(message.guild.id.toString(), message.author.id.toString());

					for (let i = 0; i < eventList.length; i++) {
						if (i > 0) {
							messageString += '\n';
						}
						let eventDate = new Date(eventList[i].time);
						let strikethrough = eventDate - new Date() <= 60000 ? '~~' : '';
						messageString += `${strikethrough}[${eventList[i].id}] **${eventList[i].name}:** ${eventList[i].description} at \`${eventDate.toString()}\`${strikethrough}`;
					}

					if (eventList.length === 0) {
						messageString = 'You have not registered in any events in this server.';
					}

					break;
				case 'list':
					eventList = events.listEvents(message.guild.id.toString());

					for (let i = 0; i < eventList.length; i++) {
						if (i > 0) {
							messageString += '\n';
						}
						let eventDate = new Date(eventList[i].time);
						let strikethrough = eventDate - new Date() <= 60000 ? '~~' : '';
						messageString += `${strikethrough}[${eventList[i].id}] **${eventList[i].name}:** ${eventList[i].description} at \`${eventDate.toString()}\`${strikethrough}`;
					}

					if (eventList.length === 0) {
						messageString = 'There are no events registered in this server.';
					}

					break;
				case 'subscribe':
					if (!args[1]) {
						messageString = 'No event ID was given to subscribe.';
						break;
					}

					let eventToSubscribe = events.getEvent(message.guild.id.toString(), args[1]);

					if (eventToSubscribe == null) {
						messageString = `No events have been found on this server with the given Id.`;
						break;
					}

					pastDate = new Date(eventToSubscribe.time) - new Date() <= 10000;

					if (pastDate) {
						messageString = `This event already happened.`;
						break;
					}

					if (events.subscribeToEvent(eventToSubscribe.id, message.author.id.toString())) {
						messageString = `Registered at event: **${eventToSubscribe.name}** ${eventToSubscribe.description}`;
					} else {
						messageString = `You are already registered at this event.`;
					}

					break;
				case 'unsubscribe':
					if (!args[1]) {
						messageString = 'No event ID was given to unsubscribe.';
						break;
					}

					let eventToUnsubscribe = events.getEvent(message.guild.id.toString(), args[1]);

					if (eventToUnsubscribe == null) {
						messageString = `No events have been found on this server with the given Id.`;
						break;
					}

					pastDate = new Date(eventToUnsubscribe.time) - new Date() <= 10000;

					if (pastDate) {
						messageString = `This event already happened.`;
						break;
					}

					if (events.unsubscribeFromEvent(eventToUnsubscribe.id, message.author.id.toString())) {
						messageString = `Unsubscribed from event: **${eventToUnsubscribe.name}** ${eventToUnsubscribe.description}`;
					} else {
						messageString = `You are already registered at this event.`;
					}

					break;
				case 'add':
					if (!args[1] || !args[2]) {
						message.channel.send('Event name or time is missing `add \"event name here\" \"25 Dec 2777 00:00:00 GMT\" \"(optional) event description\"`.');
						break;
					}

					newDate = functions.checkIfDateIsValidAndReturn(args[2]);

					if (newDate == null) {
						messageString = `The given date was invalid.`;
						break;
					}
					if (newDate === -1) {
						messageString = `The given date is too near or in the past.`;
						break;
					}

					newEventId = events.saveEvent(message.guild.id.toString(), args[1], newDate.valueOf(), args.length > 3 ? args[3] : '');

					messageString = `Your new event: ${args[1]} at ${newDate.toString()} has been registered with id: ${newEventId}`;

					break;
				case 'remove':
					if (!args[1]) {
						message.channel.send('No event ID was given to remove.');
						return;
					}

					let deletedEventName = events.removeEvent(message.guild.id.toString(), args[1]);
					if (deletedEventName !== false) {
						messageString = `The event ${deletedEventName} was deleted with success`;
					} else {
						messageString = `No event was found with the given id.`;
					}

					break;
				case 'edit':
					if (!args[1]) {
						message.channel.send('EventId to edit is missing.');
						break;
					}

					if (!args[2] || !args[3]) {
						message.channel.send('Event name or time is missing `edit {id} \"event name here\" \"25 Dec 2777 00:00:00 GMT\" \"(optional) event description\"`.');
						break;
					}

					newDate = functions.checkIfDateIsValidAndReturn(args[3]);

					if (newDate == null) {
						messageString = `The given date was invalid.`;
						break;
					}
					if (newDate === -1) {
						messageString = `The given date is too near or in the past.`;
						break;
					}

					newEventId = events.saveEvent(message.guild.id.toString(), args[2], newDate.valueOf(), args.length > 4 ? args[4] : '', args[1]);

					messageString = `Your event: ${args[2]} at ${newDate.toString()} with id: ${newEventId} has been edited.`;

					break;
			}
		}

		message.channel.send(messageString, { split: true })
			.catch(function(error) {
				console.error(error);
				message.reply('I\'m sorry, something went wrong.');
			});
	},
};