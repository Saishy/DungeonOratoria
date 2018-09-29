const functions = {
	getAllAssists: function () {
		return assists.array();
	},

	getAssistById: function (id) {
		return assists.get(id);
	},

	findAssists: function (args, stars) {
		if (args === null || !args) {
			return -1;
		}

		if (args.constructor !== Array) {
			return -1;
		}

		const assSearch = stars !== undefined ? assists.filter(adv => adv.stars === stars) : assists;

		if (args.length === 0) {
			return assSearch.array();
		}

		const byName = assSearch.findAll('name', args.join(' ').replace(/[\[\]]/g, ''));
		const byTitle = assSearch.findAll('title', args.join(' ').replace(/[\[\]]/g, ''));

		//console.log(byName);
		//console.log(byTitle);

		if (byName.length === 0) {
			if (byTitle.length === 1) {
				return byTitle[0];
			}
		}

		if (byName.length === 1) {
			if (byTitle.length === 0) {
				return byName[0];
			}
		}

		//const nameStr = args.join("_").toLowerCase();
		//const returnVal = assSearch.filterArray(a => a.id.indexOf(nameStr) !== -1);

		const arraySearch = [];

		for (let i = 0; i < args.length; i++) {
			arraySearch[i] = args[i].toLowerCase();
			arraySearch[i] = arraySearch[i].replace(/[\[\]]/g, '');
		}

		//console.log(arraySearch);

		const returnVal = assSearch.filterArray(function(ass) {
			const stringToSearch = `${ass.name.toLowerCase()} ${ass.title.toLowerCase()}`;

			return isEvery = arraySearch.every(item => stringToSearch.includes(item));
		});

		if (returnVal.length === 0) {
			return -1;
		}

		return returnVal;
	},

	findAssistsByStars: function(stars) {
		const returnVal = assists.findAll('stars', stars);

		if (returnVal.length === 0) {
			return -1;
		}

		return returnVal;
	},

	setAssistSkillId: function (assistId, skillOrder, newId) {
		const assist = assists.get(assistId);

		assists.skills[skillOrder].id = newId;

		/*for (let x = 0; x < assist.skills.length; x++) {
			if (assist.skills[x].name === skillName) {
				assist.skills[x].id = newId;
			}
		}*/
	},

	createEmbedFromAssist: function (assist, limitBreak) {
		const skill = `${assist.skills[0].name}\n${skillToEmbed(assist.skills[0], '\n')}`;
		const skillMLB = `${assist.skills[1].name}\n${skillToEmbed(assist.skills[1], '\n')}`;

		if (limitBreak === undefined) {
			limitBreak = 0;
		}

		//console.log(`limitBreak: ${limitBreak}`);

		const embed = {
			color: 0xa5d800,
			fields: [
				{
					name: `Assist ${assist.limited ? ' [Time-Limited]' : ''} ${limitBreak > 0 ? ':diamonds:'.repeat(limitBreak) : ''}`,
					value: `[${assist.title}] ${assist.name} ${'⭐️'.repeat(assist.stars)}`
				}/*,
				{
					name: '\u200b',
					value: '\u200b',
				}*/,
				{
					name: "Stats",
					value: `**HP:**      ${assist.stats.hp[limitBreak]}\n**MP:**      ${assist.stats.mp[limitBreak]}\n**P.AT:**   ${assist.stats.physical_attack[limitBreak]}\n**M.AT:**  ${assist.stats.magic_attack[limitBreak]}\n**DEF:**     ${assist.stats.defense[limitBreak]}`,
					inline: true
				},
				{
					name: "Abilities",
					value: `**STR:**   ${assist.stats.strength[limitBreak]}\n**END:**   ${assist.stats.endurance[limitBreak]}\n**DEX:**   ${assist.stats.dexterity[limitBreak]}\n**AGI:**    ${assist.stats.agility[limitBreak]}\n**MAG:**  ${assist.stats.magic[limitBreak]}`,
					inline: true
				},
				{
					name: "Skill:",
					value: `${(skill === '') ? 'This unit is missing this skill' : skill}`
				},
				{
					name: limitBreak === 5 ? "Skill:" : "At +5:",
					value: `${skillMLB === '' ? 'This unit is missing this skill' : skillMLB}`
				}
			]
		};

		if (limitBreak === 5) {
			embed.fields.splice(-2, 1);
		}

		/*const skillsField = {
			name: "Skills:",
			value: ''
		};

		if (skill === '' && skillMLB === '') {
			skillsField.value = 'This unit is missing their skills';
		} else {

		}

		embed.fields.push(skillsField);*/

		if (assist.limited) {
			embed.footer = {
				"text": "Time-Limited"
			};
		}

		return embed;
	}
};

for(let key in functions) {
	module.exports[key] = functions[key];
}

const fs = require('fs');
const Discord = require('discord.js');
const assists = new Discord.Collection();

const assistFiles = fs.readdirSync('./database/assists');

for (const file of assistFiles) {
	if (file.indexOf('_template') !== -1) {
		continue;
	}
	const assist = require(`../database/assists/${file}`);
	assists.set(assist.id, assist);
}

const { skillToEmbed } = require('./skills.js');