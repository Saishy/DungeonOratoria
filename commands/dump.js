const { getAllAssists } = require('../methods/assists.js');
const { getAllAdventurers } = require('../methods/adventurers.js');

module.exports = {
    name: 'dump',
    description: 'Returns all adventurers and assists this bot contains (SPAM ALERT): admin-only',
	args: false,
    execute(message, args) {
    	if (message.channel.type === 'text') {
			if (!message.member.hasPermission('MANAGE_MESSAGES', false, true, true)) {
				return message.channel.send(`${message.author} is not in the admin role.\nThis incident will be reported.`);
			}
		}

		const assists = getAllAssists();
		const adventurers = getAllAdventurers();

		let msgResult = '**This bot contains the following Assists:**';

		for (let i = 0; i < assists.length; i++) {
			msgResult += '\n';

			msgResult += `[${assists[i].title}] ${assists[i].name}`;
		}

		message.channel.send(msgResult, {split: true});

		msgResult = '**This bot contains the following Adventurers:**';

		for (let i = 0; i < adventurers.length; i++) {
			msgResult += '\n';

			msgResult += `[${adventurers[i].title}] ${adventurers[i].name}`;
		}

		//message.channel.send(`Command name: ${command}\nArguments: ${args}`);
		message.channel.send(msgResult, {split: true});
    },
};