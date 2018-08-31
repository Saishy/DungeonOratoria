const {	prefix } = require('../config.json');
const { findAssistsByStars } = require('../methods/assists.js');
const { findAdventurersByStars } = require('../methods/adventurers.js');

module.exports = {
	name: 'stars',
	description: 'searches all units with the given star ranking',
	args: true,
	example: `\`${prefix}stars 4\` Will send a list of all units with 4 stars.\n`,
	execute(message, args) {
		const regex = /(\d+)/;
		const stars = parseInt(regex.exec(args.join(' '))[0]);

		if (isNaN(stars) || (stars <= 0 || stars > 4)) {
			return message.channel.send(`You didn't input a valid number, ${message.author}!`);
		}

		let msgResult = '';

		const resultAssists = findAssistsByStars(stars);
		const resultAdventurers = findAdventurersByStars(stars);

		if (resultAssists !== -1) {
			if (msgResult !== '') {
				msgResult += '\n\n';
			}
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