/*const skills = {
	assists: require('../database/skills/assist_skills.json')
};*/

const functions = {
	findSkillsByEffects: function (effects, type = 'all') {
		if (effects === null || !effects) {
			return -1;
		}

		if (effects.constructor !== Array) {
			effects = [effects];
		}

		effects = organizeTermsWithSpaces(effects);

		const modifiers = [];
		for (let i = 0; i < effects.length; i++) {
			if (effects[i].charAt(0) === '-' || effects[i].charAt(0) === '+' || effects[i].charAt(0) === '%') {
				modifiers[i] = effects[i].charAt(0);
				effects[i] = effects[i].substring(1);
			} else {
				modifiers[i] = false;
			}

			effects[i] = fromHumanInput(effects[i]);
		}

		//console.log(`effects: ${effects}`);

		let returnVal = {
			advSkills: [],
			assSkills: []
		};

		if (type === 'all' || type === 'assist') {
			returnVal.assSkills = skills.assists.filterArray(function (sk) {
				//console.log(sk);
				for (let x = 0; x < sk.effects.length; x++) {
					//console.log(sk.effects[x].attribute);
					/*if (effects.includes(sk.effects[x].attribute)) {
						//console.log(sk.effects[x].attribute);

						return true;
					}*/
					for (let i = 0; i < effects.length; i++) {
						if (effects[i] === sk.effects[x].attribute) {
							//console.log(`attribute: ${sk.effects[x].attribute}`);

							if (modifiers[i] !== false) {
								if (sk.effects[x].modifier.indexOf(modifiers[i]) !== -1) {
									//console.log(`modifier: ${sk.effects[x].modifier}`);

									return true;
								}
							} else {
								return true;
							}

						}
					}
				}

				return false;
			});
		}

		if (type === 'all' || type === 'adventurer') {
			returnVal.advSkills = skills.adventurers.filterArray(function (sk) {
				//console.log(sk);
				for (let x = 0; x < sk.effects.length; x++) {
					//console.log(sk.effects[x].attribute);
					/*if (effects.includes(sk.effects[x].attribute)) {
						//console.log(sk.effects[x].attribute);

						return true;
					}*/
					for (let i = 0; i < effects.length; i++) {
						if (sk.effects[x].attribute === 'damage' ? effects[i] === sk.effects[x].type : effects[i] === sk.effects[x].attribute) {
							//console.log(`attribute: ${sk.effects[x].attribute}`);

							if (modifiers[i] !== false) {
								if (sk.effects[x].modifier.indexOf(modifiers[i]) !== -1) {
									//console.log(`modifier: ${sk.effects[x].modifier}`);

									return true;
								}
							} else {
								return true;
							}

						}
					}
				}

				return false;
			});
		}

		if (returnVal.advSkills.length === 0 && returnVal.assSkills.length === 0) {
			return -1;
		}

		return returnVal;
	},

	findCombatSkillsByEffects: function(effects) {

	},

	getSkillOwnerId: function(skill) {
		//console.log(skill);
		let returnVal = skillIdToCharIdMap.assists.get(skill.id);
		if (!returnVal) {
			returnVal = skillIdToCharIdMap.adventurers.get(skill.id)
		}
		return returnVal;
	},

	getSkillById: function (id, type = 'all') {
		let assSkills = false;
		let advSkills = false;

		switch (type) {
			case 'all':
				assSkills = skills.assists.get(id);

				if (assSkills) {
					return assSkills;
				}

				advSkills = skills.adventurers.get(id);

				if (advSkills) {
					return advSkills;
				}

				break;
			case 'assist':
				assSkills = skills.assists.get(id);

				if (assSkills) {
					return assSkills;
				}
				break;
			case 'adventurer':
				advSkills = skills.adventurers.get(id);

				if (advSkills) {
					return advSkills;
				}

				break;
		}

		return -1;
	},

	skillToEmbed: function (skill, joinString) {
		/*let resultString = '';

		let skill = module.exports.getSkillById(id, type);

		if (skill === -1) {
			return resultString;
		}*/

		let resultString = '';//`${skill.name}`;

		//console.log(id);

		for (let i = 0; i < skill.effects.length; i++) {
			//resultString += `\n[${toHumanReadable(skill.effects[i].target)}] ${toHumanReadable(skill.effects[i].attribute)} ${skill.effects[i].modifier}`;
			resultString += `${i > 0 && joinString ? joinString : ''}[${toHumanReadable(skill.effects[i].target)}] ${toHumanReadable(skill.effects[i].attribute)} ${skill.effects[i].modifier}`;
		}

		return resultString;
	},

	combatSkillToEmbed: function (skill, joinString) {
		let resultString = '';

		if (skill == null) {
			return resultString;
		}

		//console.log(skill);

		for (let i = 0; i < skill.effects.length; i++) {
			if (skill.effects[i].attribute === "damage") {
				resultString += `${i > 0 && joinString ? joinString : ''}[${toHumanReadable(skill.effects[i].target)}] ${skill.effects[i].speed ? toHumanReadable(skill.effects[i].speed) + ' ' : ''}${toHumanReadable(skill.effects[i].modifier)} ${toHumanReadable(skill.effects[i].type)}`
			} else if (skill.effects[i].attribute === "life_steal") {
				resultString += ` w/ ${toHumanReadable(skill.effects[i].attribute).replace('$1', skill.effects[i].modifier)}`;
			} else {
				resultString += `${i > 0 && joinString ? joinString : ''}[${toHumanReadable(skill.effects[i].target)}] ${toHumanReadable(skill.effects[i].attribute)} ${toHumanReadable(skill.effects[i].modifier)}${skill.effects[i].duration ? ` for ${skill.effects[i].duration} turns` : ''}`;
			}
		}

		return resultString;
	}

	/*getReadableSkillEffects: function (skill) {
		let resultString = '';

		//console.log(skill);

		for (let i = 0; i < skill.effects.length; i++) {
			resultString += `[${toHumanReadable(skill.effects[i].target)}] ${toHumanReadable(skill.effects[i].attribute)} ${skill.effects[i].modifier} `;
		}

		return resultString;
	}*/
};

for(let key in functions) {
	module.exports[key] = functions[key];
}

const Discord = require('discord.js');

const { getAllAssists } = require('./assists.js');
const { getAllAdventurers } = require('./adventurers.js');
const { fromHumanInput, toHumanReadable, organizeTermsWithSpaces } = require('./human_translate.js');

const skills = {
	assists: new Discord.Collection(),
	adventurers: new Discord.Collection()
};

const skillIdToCharIdMap = {
	assists: new Discord.Collection(),
	adventurers: new Discord.Collection()
};

// Assists' Skills

let assistsArray = getAllAssists();

for (let count = 0; count < assistsArray.length; count++) {
	for (let x = 0; x < assistsArray[count].skills.length; x++) {
		let skillId = `${assistsArray[count].id}_${assistsArray[count].skills[x].name.replace(/\s+/g, '_').replace(/'/g, '')}`;
		//setAssistSkillId(assistsArray[count].id, x, skillId);
		assistsArray[count].skills[x].id = skillId;

		if (skills.assists.get(skillId)) {
			console.error(`skill id already registered: ${assistsArray[count].skills[x].name}`);
		}

		if (skillIdToCharIdMap.assists.get(skillId)) {
			console.error(`skill id to char id already registered: ${assistsArray[count].skills[x].name}`);
		}

		skills.assists.set(skillId, assistsArray[count].skills[x]);
		skillIdToCharIdMap.assists.set(skillId, assistsArray[count].id);
	}
}

// Adventurers' Skills

let adventurersArray = getAllAdventurers();

function setAdventurerSkillAndAdd(skillObj, adventurerId) {
	if (skillObj.name.indexOf(' Placeholder') !== -1) {
		return;
	}

	let skillId = `${adventurerId}_${skillObj.name.replace(/\s+/g, '_').replace(/'/g, '')}`;
	//setAssistSkillId(assistsArray[count].id, x, skillId);
	skillObj.id = skillId;

	if (skills.adventurers.get(skillId)) {
		console.error(`skill id already registered: ${adventurerId} ${skillObj.name}`);
	}

	if (skillIdToCharIdMap.adventurers.get(skillId)) {
		console.error(`skill id to char id already registered: ${skillObj.name}`);
	}

	skills.adventurers.set(skillId, skillObj);
	skillIdToCharIdMap.adventurers.set(skillId, adventurerId);
}

for (let count = 0; count < adventurersArray.length; count++) {
	//console.log(adventurersArray[count].id);
	setAdventurerSkillAndAdd(adventurersArray[count].skills.special, adventurersArray[count].id);

	for (let x = 0; x < adventurersArray[count].skills.combat.length; x++) {
		setAdventurerSkillAndAdd(adventurersArray[count].skills.combat[x], adventurersArray[count].id);
	}
}