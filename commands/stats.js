const { prefix } = require('../config.json');
const { findAssists, createEmbedFromAssist } = require('../methods/assists.js');
const { findAdventurers, createEmbedFromAdventurer } = require('../methods/adventurers.js');

module.exports = {
    name: 'stats',
    description: 'Returns the character data with the given name, if more than one is found returns a list of names',
	args: true,
	usage: '<unit name/title>',
	example: `\`%stats +5 all abroad\` will return [All Abroad] Hestia stats at max limit break.\n`
	+ `Searching for the exact specific name or title of an unit will return it if only one is found (Ti for example).\n`
	+ `If no exact match is found, it will return a list of units matching the search data.`,
    execute(message, args) {
		let resultAdventurers;
		let resultAssists;

		const starRegex = /(\d)\*/;
		let stars = undefined;
		for (let i = 0; i < args.length; i++) {
			let regexResult = starRegex.exec(args[i]);
			if (regexResult === null) {
				continue;
			}

			stars = parseInt(regexResult[1]);
			if (!isNaN(stars)) {
				args.splice(i, 1);
				break;
			} else {
				stars = undefined;
			}
		}

		const limitBreakRegex = /\+(\d)/;
		let limitBreak = undefined;
		for (let i = 0; i < args.length; i++) {
			let regexResult = limitBreakRegex.exec(args[i]);
			if (regexResult === null) {
				continue;
			}

			limitBreak = parseInt(regexResult[1]);
			if (!isNaN(limitBreak)) {
				args.splice(i, 1);
				break;
			} else {
				limitBreak = undefined;
			}
		}

		/*if (args.length === 0) {
			return message.channel.send(`No arguments were given, ${message.author}!`);
		}*/

    	if (args.length > 0 && args[0].toLowerCase() === "hermeme") {
			resultAdventurers = findAdventurers(['Hermes&Hermes']);

			resultAssists = -1;
		} else {
			resultAdventurers = findAdventurers(args, stars);

			resultAssists = findAssists(args, stars);
		}

		if (resultAssists === -1 && resultAdventurers === -1) {
			return message.channel.send(`No results found, ${message.author}!`);
		}

		/*console.log(`resultAssists: ${resultAssists}`);
		console.log(`resultAssists length: ${resultAssists.length}`);
		console.log(`resultAdventurers: ${resultAdventurers}`);
		console.log(`resultAdventurers length: ${resultAdventurers.length}`);*/

		let msgResult = '';

		if (resultAssists !== -1 && resultAssists.constructor !== Array) {
			msgResult = { embed: createEmbedFromAssist(resultAssists, limitBreak)};
			return message.channel.send(msgResult);
		}

		if (resultAdventurers !== -1 && resultAdventurers.constructor !== Array) {
			msgResult = { embed: createEmbedFromAdventurer(resultAdventurers, limitBreak)};
			return message.channel.send(msgResult);
		}

		if (resultAdventurers === -1 && resultAssists.length === 1) {
			msgResult = { embed: createEmbedFromAssist(resultAssists[0], limitBreak)};
		} else if (resultAssists === -1 && resultAdventurers.length === 1) {
			msgResult = { embed: createEmbedFromAdventurer(resultAdventurers[0], limitBreak)};
		} else {
			if (resultAssists !== -1) {
				msgResult += '**The following assists have been found:**';
				for (let i = 0; i < resultAssists.length; i++) {
					msgResult += '\n';

					msgResult += `[${resultAssists[i].title}] ${resultAssists[i].name}`;
				}
			}

			if (resultAdventurers !== -1) {
				if (msgResult !== '') {
					msgResult += '\n\n';
				}
				msgResult += '**The following adventurers have been found:**';
				for (let i = 0; i < resultAdventurers.length; i++) {
					msgResult += '\n';

					msgResult += `[${resultAdventurers[i].title}] ${resultAdventurers[i].name}`;
				}
			}
		}

		if (msgResult.length >= 1500) {
			return message.author.send(msgResult, { split: true })
				.then(() => {
					if (message.channel.type !== 'dm') {
						message.channel.send(`Too many results found, I've sent you a DM! ${message.author}!`);
					}
				})
				.catch(() => message.reply('it seems like I can\'t DM you!'));
		}

		//message.channel.send(`Command name: ${command}\nArguments: ${args}`);
		message.channel.send(msgResult);
    }
};