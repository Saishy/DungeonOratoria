const redis = require('redis');
let redisClient;
let discordClient;

let events = {};
const redisObjName = 'events';
let currentEventID = 0;

const OnError = function (err) {
	console.error("Redis Error: " + err);
};

const eventCheckInterval = function() {
	const now = Date.now();

	Object.keys(events).forEach(function (key) {
		let current = events[key]
		// iteration code
		let timeDiff = now - current.time;
		if (timeDiff >= -60000 && timeDiff <= 0 && !current.bHappened) {
			current.bHappened = true;

			alertEventToSubscribers(current);
		}

		if (timeDiff >= 3600000) {
			//console.log(`Removing eventid: ${current.id} name: ${current.name} of timeDiff: ${timeDiff}`);
			functions.removeEventUnsafe(current.id);
		}
	})
};

const alertEventToSubscribers = function(eventToAlert) {
	if (!eventToAlert.subscribers) {
		return;
	}

	for (let i = 0; i < eventToAlert.subscribers.length; i++) {
		discordClient.fetchUser(eventToAlert.subscribers[i])
			.then((fetchedUser) => {
				// Do something with the User object
				fetchedUser.send(`${eventToAlert.name}: ${eventToAlert.description} have started!`, {split: true});
			})
			.catch((err) => {
				// Do something with the Error object, for example, console.error(err);
				console.error(err);
			});
	}
};

const functions = {
	initialize: function (newClient)
	{
		discordClient = newClient;

		redisClient = redis.createClient({
			port: process.env.REDIS_PORT,
			password: process.env.REDIS_PWD
		});

		redisClient.on("error", OnError);

		redisClient.get(`${redisObjName}:currentEventID`, function (err, reply) {
			if (reply !== null) {
				currentEventID = parseInt(reply);
			}
		});

		redisClient.hgetall(`${redisObjName}:events`, function (err, obj) {
			//console.log(obj);
			//Object.assign(events, obj);
			if (obj == null) {
				events = {};
				return;
			}

			events = obj;

			Object.keys(events).forEach(function (key) {
				let current = events[key];
				// iteration code
				events[key] = JSON.parse(current);
			});

			//console.log(events);
		});

		setInterval(eventCheckInterval, 25*1000);
	},

	quit: function () {
		redisClient.quit();
	},

	listEventsByServerAndUser: function(toLookServerId, toLookUserId) {
		let returnArray = [];

		Object.keys(events).forEach(function (key) {
			let current = events[key];
			/*console.log(current);
			console.log(typeof current);
			console.log(current.serverId === toLookServerId);
			console.log(current.serverId, toLookServerId);*/
			// iteration code
			if (current.serverId === toLookServerId && current.subscribers && current.subscribers.includes(toLookUserId)) {
				//console.log('match');
				returnArray.push({
					id: current.id,
					name: current.name,
					time: current.time,
					description: current.description
				});
			}
		});

		return returnArray;
	},

	listEvents: function(toLookServerId) {
		let returnArray = [];

		/*console.log(Object.keys(events));
		console.log(toLookServerId);
		console.log(typeof toLookServerId);*/

		Object.keys(events).forEach(function (key) {
			let current = events[key];
			/*console.log(current);
			console.log(typeof current);
			console.log(current.serverId === toLookServerId);
			console.log(current.serverId, toLookServerId);*/
			// iteration code
			if (current.serverId === toLookServerId) {
				//console.log('match');
				returnArray.push({
					id: current.id,
					name: current.name,
					time: current.time,
					description: current.description
				});
			}
		});

		return returnArray;
	},

	/// callback will be called with either null or an object representing the event.
	getEvent: function (currentServerId, eventID) {
		/*redisClient.hget(`${redisObjName}:events`, `${eventID}`, function (err, reply) {
			if (reply !== null) {
				callback(JSON.parse(reply));
			} else {
				callback(null);
			}
		});*/
		if (events[eventID].serverId !== currentServerId) {
			return null;
		}

		return events[eventID];
	},

	subscribeToEvent: function (eventID, userID) {
		if (!events[eventID].subscribers) {
			events[eventID].subscribers = [];
		}

		//console.log(events[eventID].subscribers.length);
		//console.log(events[eventID].subscribers);
		for (let i = 0; i < events[eventID].subscribers.length; i++) {
			if (events[eventID].subscribers[i] === userID) {
				return false;
			}
		}

		events[eventID].subscribers.push(userID);

		redisClient.hset(`${redisObjName}:events`, `${eventID}`, JSON.stringify(events[eventID]));

		return true;
	},

	unsubscribeFromEvent: function (eventID, userID) {
		if (!events[eventID].subscribers) {
			return true;
		}

		let bReturn = false;

		for (let i = 0; i < events[eventID].subscribers.length; i++) {
			if (events[eventID].subscribers[i] === userID) {
				delete events[eventID].subscribers[i];
				bReturn = true;
				break;
			}
		}

		redisClient.hset(`${redisObjName}:events`, `${eventID}`, JSON.stringify(events[eventID]));

		return bReturn;
	},

	saveEvent: function (serverID, eventName, eventTime, eventDsc, eventID) {
		let newEvent = {
			id: eventID === undefined ? currentEventID : eventID,
			serverId: serverID,
			name: eventName,
			time: eventTime,
			description: eventDsc === undefined ? '' : eventDsc
		};

		if (eventID === undefined) {
			if (currentEventID === Number.MAX_SAFE_INTEGER) {
				currentEventID = 0;
			} else {
				currentEventID++;
			}
		}

		redisClient.hset(`${redisObjName}:events`, `${newEvent.id}`, JSON.stringify(newEvent));

		redisClient.set(`${redisObjName}:currentEventID`, currentEventID);

		events[newEvent.id] = newEvent;

		return newEvent.id;
	},

	/// callback will be called with either null or an object representing the edited event.
	editEvent: function (eventID, eventName, eventTime, eventDsc, callback) {
		let eventObj = functions.getEvent(eventID);

		if (eventObj != null) {
			eventObj.name = eventName;
			eventObj.time = eventTime;
			eventObj.description = eventDsc;

			redisClient.hset(`${redisObjName}:events`, `${eventObj.id}`, JSON.stringify(eventObj));

			events[eventObj.id] = eventObj;
		}

		callback(eventObj);
	},

	removeEvent: function (serverID, eventID) {
		let eventName = events[eventID].name;

		if (events[eventID].serverId !== serverID) {
			return false;
		}

		functions.removeEventUnsafe(eventID);
		return eventName;
	},

	removeEventUnsafe: function (eventID) {
		redisClient.hdel(`${redisObjName}:events`, `${eventID}`);
		delete events[eventID];
	}
};

for (let key in functions) {
	module.exports[key] = functions[key];
}