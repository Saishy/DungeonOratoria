const { prefix } = require('../config.json');
const { findSkillsByEffects, skillToEmbed, getSkillOwnerId } = require('../methods/skills.js');
const { getAssistById } = require('../methods/assists.js');
//const { fromHumanInput } = require('../methods/human_translate.js');

module.exports = {
    name: 'skills',
    description: 'Searches for all assist skills matching given data',
	args: true,
	usage: '<one or more attribute(s)>',
	example: `\`${prefix}skills physres\` Will send a list of all assist skills that gives physical resist.\n` +
	`\`${prefix}skills sleepres -magic\` Will send a list of all assist skills that gives either sleep resist or debuffs magic.`,
    execute(message, args) {
    	const arraySearch = [];

		for (let i = 0; i < args.length; i++) {
			arraySearch[i] = args[i].toLowerCase();
			//arraySearch[i] = arraySearch[i].replace(/[\[\]]/g, '');
			//arraySearch[i] = fromHumanInput(arraySearch[i]);
		}

		let resultVal = findSkillsByEffects(arraySearch, 'assist');
		if (resultVal === -1) {
			return message.channel.send(`No results found, ${message.author}!\n***This command only searches for assist's skills***`);
		}

		// Remove this if you want to search adventurers skills too!
		//resultVal = resultVal.assSkills;

		//console.log(resultVal);
		//console.log(resultVal.length);

		const assists = {};

		for (let counter = 0; counter < resultVal.assSkills.length; counter++) {
			let assistOwner = getAssistById(getSkillOwnerId(resultVal.assSkills[counter]));

			if (!assists[assistOwner.id]) {
				assists[assistOwner.id] = {};
				assists[assistOwner.id].skills = [];
				assists[assistOwner.id].name = assistOwner.name;
				assists[assistOwner.id].title = assistOwner.title;
			}

			assists[assistOwner.id].skills.push(resultVal.assSkills[counter])
		}

		let assistKeys = Object.keys(assists);
		//console.log(assistKeys);

		let msgResult = '';
		for (let i = 0; i < assistKeys.length; i++) {
			if (i !== 0) {
				msgResult += '\n';
			}

			//console.log(assistKeys[i]);

			msgResult += `**[${assists[assistKeys[i]].title}] ${assists[assistKeys[i]].name}**\n`;
			for (let x = 0; x < assists[assistKeys[i]].skills.length; x++) {
				msgResult += `${assists[assistKeys[i]].skills[x].name}: ${skillToEmbed(assists[assistKeys[i]].skills[x], ' ')}`;

				if (x < assists[assistKeys[i]].skills.length) {
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