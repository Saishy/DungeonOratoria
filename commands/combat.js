const { prefix } = require('../config.json');
const { findSkillsByEffects, combatSkillToEmbed, getSkillOwnerId } = require('../methods/skills.js');
const { getAdventurerById } = require('../methods/adventurers.js');

module.exports = {
	name: 'combat',
	description: 'Searches for all adventurer skills matching given data',
	aliases: ['skillsadv', 'advskills'],
	args: true,
	usage: '<one or more attribute(s)>',
	example: `\`${prefix}combat light_magic_attack\` Will send a list of all adventurer skills that does light magic damage.\n` +
	`\`${prefix}combat sleepres -magic\` Will send a list of all adventurer skills that gives either sleep resist or debuffs magic.`,
	execute(message, args) {
		const arraySearch = [];

		for (let i = 0; i < args.length; i++) {
			arraySearch[i] = args[i].toLowerCase();
		}

		let resultVal = findSkillsByEffects(arraySearch, 'adventurer');
		if (resultVal === -1) {
			return message.channel.send(`No results found, ${message.author}!`);
		}

		// Remove this if you want to search adventurers skills too!
		//resultVal = resultVal.advSkills;

		//console.log(resultVal);
		//console.log(resultVal.length);

		const adventurers = {};

		for (let counter = 0; counter < resultVal.advSkills.length; counter++) {
			let advOwner = getAdventurerById(getSkillOwnerId(resultVal.advSkills[counter]));

			if (!adventurers[advOwner.id]) {
				adventurers[advOwner.id] = {};
				adventurers[advOwner.id].skills = [];
				adventurers[advOwner.id].name = advOwner.name;
				adventurers[advOwner.id].title = advOwner.title;
			}

			adventurers[advOwner.id].skills.push(resultVal.advSkills[counter])
		}

		let assistKeys = Object.keys(adventurers);
		//console.log(assistKeys);

		let msgResult = '';
		for (let i = 0; i < assistKeys.length; i++) {
			if (i !== 0) {
				msgResult += '\n';
			}

			//console.log(assistKeys[i]);

			msgResult += `**[${adventurers[assistKeys[i]].title}] ${adventurers[assistKeys[i]].name}**\n`;
			for (let x = 0; x < adventurers[assistKeys[i]].skills.length; x++) {
				msgResult += `${adventurers[assistKeys[i]].skills[x].name}: ${combatSkillToEmbed(adventurers[assistKeys[i]].skills[x], ' ')}`;

				if (x < adventurers[assistKeys[i]].skills.length) {
					msgResult += `\n`;
				}
			}

			/*if (i < assistKeys.length) {
				msgResult += '\n';
			}*/
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
	},
};