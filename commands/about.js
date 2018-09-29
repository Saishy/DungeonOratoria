module.exports = {
    name: 'about',
    description: 'Information about me',
	args: false,
    execute(message, args) {
		let msgResult = '**To add this bot to your server click here:** <https://discordapp.com/api/oauth2/authorize?client_id=443094322875990016&permissions=67192832&scope=bot>' +
			'\n\n\nYou can use me at the official **DanMemo Server:** https://discord.gg/vJnUwrQ\n' +
			'\n\nMy development discord server is: <https://discord.gg/2VgEDjb>\n\n' +
			'This bot was written by Saishy: <https://twitter.com/SaishyKitty>\n' +
			'You can help support my development by buying us a coffee! <https://ko-fi.com/saishy>';

		message.author.send(msgResult, { split: true })
			.then(() => {
				if (message.channel.type !== 'dm') {
					message.channel.send('I\'ve sent you a DM with my information.');
				}
			})
			.catch(() => message.reply('it seems like I can\'t DM you!'));
    },
};