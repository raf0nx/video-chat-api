const redis = require('redis');
const bluebird = require('bluebird');

const config = require('../config/index');

bluebird.promisifyAll(redis);

class Redis {
	client = redis.createClient({ host: config.REDIS_HOST });

	async addUser(room, socketId, user) {
		try {
			await this.client.hsetAsync(room, socketId, JSON.stringify(user));
		} catch (error) {
			console.error(error);
		}
	}

	async getUsers(room) {
		try {
			const userList = [];
			const users = await this.client.hgetallAsync(room);

			for (const user in users) {
				userList.push(JSON.parse(users[user]));
			}

			return userList;
		} catch (error) {
			console.error(error);
		}
	}

	async deleteUser(room, socketId) {
		try {
			const response = await this.client.hdelAsync(room, socketId);

			return response;
		} catch (error) {
			console.error(error);
		}
	}

	async getUser(room, socketId) {
		try {
			const user = await this.client.hgetAsync(room, socketId);

			return JSON.parse(user);
		} catch (error) {
			console.error(error);
		}
	}

	getClientsInRoom(io, namespace, room) {
		return new Promise((resolve, reject) => {
			io.of(namespace).adapter.clients([room], (error, clients) => {
				if (error) {
					reject(error);
				}

				resolve(clients.length);
			});
		});
	}

	async setUser(room, socketId, newValue) {
		try {
			const user = await this.client.hsetAsync(
				room,
				socketId,
				JSON.stringify(newValue)
			);

			return user;
		} catch (error) {
			console.error(error);
		}
	}
}

module.exports = new Redis();