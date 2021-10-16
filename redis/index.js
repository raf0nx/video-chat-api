const redis = require("redis");
const bluebird = require("bluebird");
require("dotenv").config();

const config = require("../config/index");

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
      await this.client.hdelAsync(room, socketId);
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

  async setRefreshToken(email, refreshToken) {
    try {
      await this.client.hsetAsync(process.env.TOKEN_KEY, email, refreshToken);
    } catch (err) {
      console.error(err);
    }
  }

  async getRefreshTokens() {
    try {
      const refreshTokens = await this.client.hgetallAsync(
        process.env.TOKEN_KEY
      );
      return refreshTokens;
    } catch (err) {
      console.error(err);
    }
  }

  async deleteRefreshToken(email) {
    try {
      await this.client.hdelAsync(process.env.TOKEN_KEY, email);
    } catch (err) {
      console.error(err);
    }
  }

	async setSocket(socketId, payload) {
		try {
			await this.client.hsetAsync(config.SOCKETS_KEY, socketId, JSON.stringify(payload));
		} catch (err) {
			console.erorr(err);
		}
	}

	async getSockets() {
		try {
			const sockets = await this.client.hgetallAsync(config.SOCKETS_KEY);
			return sockets;
		} catch (err) {
			console.erorr(err);
		}
	}

	async getSocket(socketId) {
		try {
			const socket = await this.client.hgetAsync(config.SOCKETS_KEY, socketId);
			return socket;
		} catch (err) {
			console.error(err);
		}
	}

	async deleteSocket(socketId) {
		try {
			await this.client.hdelAsync(config.SOCKETS_KEY, socketId);
		} catch (err) {
			console.error(err);
		}
	}
}

module.exports = new Redis();
