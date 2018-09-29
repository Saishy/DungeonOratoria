/*
If copying from a table, regex:
\[.*?(\d+).+?(\d+).+?(\d+).+?(\d+).+?(\d+).+?(\d+)
[$1, $2, $3, $4, $5, $6
 */

const functions = {
	getAllAdventurers: function () {
		return adventurers.array();
	},

	getAdventurerById: function (id) {
		return adventurers.get(id);
	},

	findAdventurers: function (args, stars) {
		if (args === null || !args) {
			return -1;
		}

		if (args.constructor !== Array) {
			return -1;
		}

		// First filter by star if provided
		const advSearch = stars !== undefined ? adventurers.filter(adv => adv.stars === stars) : adventurers;

		if (args.length === 0) {
			return advSearch.array();
		}

		// Try to get a name or title matching exactly what was given
		const byName = advSearch.findAll('name', args.join(' ').replace(/[\[\]]/g, ''));
		const byTitle = advSearch.findAll('title', args.join(' ').replace(/[\[\]]/g, ''));

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
		//const returnVal = advSearch.filterArray(a => a.id.indexOf(nameStr) !== -1);
		const arraySearch = [];

		for (let i = 0; i < args.length; i++) {
			arraySearch[i] = args[i].toLowerCase();
			arraySearch[i] = arraySearch[i].replace(/[\[\]]/g, '');
		}

		//console.log(arraySearch);

		const returnVal = advSearch.filterArray(function(adv) {
			const stringToSearch = `${adv.name.toLowerCase()} ${adv.title.toLowerCase()}`;

			return isEvery = arraySearch.every(item => stringToSearch.includes(item));
		});

		if (returnVal.length === 0) {
			return -1;
		}

		return returnVal;
	},

	findAdventurersByStars: function(stars) {
		const returnVal = adventurers.findAll('stars', stars);

		if (returnVal.length === 0) {
			return -1;
		}

		return returnVal;
	},

	createEmbedFromAdventurer: function (adventurer, limitBreak) {
		let combatSkillsFields = [];

		for (let i = 0; i < adventurer.skills.combat.length; i++) {
			combatSkillsFields.push({
				name: `${adventurer.skills.combat[i].name}:`,
				value: `${combatSkillToEmbed(adventurer.skills.combat[i], '\n')}`
			})
		}

		if (limitBreak === undefined) {
			limitBreak = 0;
		}

		const embed = {
			color: 0x00abff,
			fields: [
				{
					name: `Adventurer${adventurer.limited ? ' [Time-Limited]' : ''} ${limitBreak > 0 ? ':diamonds:'.repeat(limitBreak) : ''}`,
					value: `[${adventurer.title}] ${adventurer.name} ${'⭐️'.repeat(adventurer.stars)}`
				}/*,
				{
					name: '\u200b',
					value: '\u200b',
				}*/,
				{
					name: "Stats",
					value: `**HP:**      ${adventurer.stats.hp[limitBreak]}\n**MP:**      ${adventurer.stats.mp[limitBreak]}\n**P.AT:**   ${adventurer.stats.physical_attack[limitBreak]}\n**M.AT:**  ${adventurer.stats.magic_attack[limitBreak]}\n**DEF:**     ${adventurer.stats.defense[limitBreak]}`,
					inline: true
				},
				{
					name: "Abilities",
					value: `**STR:**   ${adventurer.stats.strength[limitBreak]}\n**END:**   ${adventurer.stats.endurance[limitBreak]}\n**DEX:**   ${adventurer.stats.dexterity[limitBreak]}\n**AGI:**    ${adventurer.stats.agility[limitBreak]}\n**MAG:**  ${adventurer.stats.magic[limitBreak]}`,
					inline: true
				},
				{
					name: `[Special] ${adventurer.skills.special.name}:`,
					value: `${combatSkillToEmbed(adventurer.skills.special, '\n')}`
				}
			]
		};

		for (let x = 0; x < combatSkillsFields.length; x++) {
			embed.fields.push(combatSkillsFields[x]);
		}

		if (adventurer.limited) {
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
const adventurers = new Discord.Collection();

const adventurerFiles = fs.readdirSync('./database/adventurers');

for (const file of adventurerFiles) {
	if (file.indexOf('_template') !== -1) {
		continue;
	}
	const adventurer = require(`../database/adventurers/${file}`);
	adventurers.set(adventurer.id, adventurer);
}

const { combatSkillToEmbed } = require('./skills.js');