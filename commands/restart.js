module.exports = {
    name: 'restart',
    description: 'Kills this bot\'s process. And if everything goes well, restart it.',
	args: false,
    execute(message, args) {
    	if (message.author.id !== '83004911108755456') {
    		return;
		}

		message.channel.send('Restarting...').then(
			//message => console.log(`Sent message: ${message.content}`)
			//console.log('Sent message')
			() => process.exit()
		);
    },
};