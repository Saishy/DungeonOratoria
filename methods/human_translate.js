const terms = {
	input: require('../database/terms/human_input.json'),
	humanReadable: require('../database/terms/human_readable.json')
};

//const damageTypes = ['physical', 'light', 'dark', 'fire', 'ice', 'wind', 'earth', 'thunder'];
const clumpable = ['resistance', 'resist', 'res', 'attack', 'atk', 'damage', 'dmg', 'modifier', 'mod'];

const functions = {
	fromHumanInput: function (stringTerm)
	{
		if (terms.input.hasOwnProperty(stringTerm)) {
			return terms.input[stringTerm];
		}

		return stringTerm;
	},

	toHumanReadable: function (stringTerm) {
		if (terms.humanReadable.hasOwnProperty(stringTerm)) {
			return terms.humanReadable[stringTerm];
		}

		return stringTerm;
	},

	organizeTermsWithSpaces: function (termsArray) {
		let clone = [];

		for (let i = 0; i < termsArray.length; i++) {
			if (clumpable.includes(termsArray[i].toLowerCase())) {
				if ((i - 1) >= 0) {
					clone[clone.length-1] = `${termsArray[clone.length-1]} ${termsArray[i]}`;
					//termsArray.splice(i, 1);
				}
			} else {
				clone.push(termsArray[i]);
			}
		}

		return clone;
	}
};

for (let key in functions) {
	module.exports[key] = functions[key];
}