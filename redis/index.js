const redis = require("redis");
const bluebird = require("bluebird");

const config = require("../config/index");

bluebird.promisifyAll(redis);

class Redis {
  client = redis.createClient({ host: config.REDIS_HOST });

  async getUsers(room) {
    try {
      const users = await this.client.hgetallAsync(config.USERS_KEY);
      return Object.values(users)
        .map(user => JSON.parse(user))
        .filter(user => user.room === room);
    } catch (error) {
      console.error(error);
    }
  }

  async getUser(socketId) {
    try {
      const user = await this.client.hgetAsync(config.USERS_KEY, socketId);
      return JSON.parse(user);
    } catch (error) {
      console.error(error);
    }
  }

  async setUser(socketId, user) {
    try {
      await this.client.hsetAsync(
        config.USERS_KEY,
        socketId,
        JSON.stringify(user)
      );
    } catch (error) {
      console.error(error);
    }
  }

  async deleteUser(socketId) {
    try {
      await this.client.hdelAsync(config.USERS_KEY, socketId);
    } catch (error) {
      console.error(error);
    }
  }

  async setRefreshToken(email, refreshToken) {
    try {
      await this.client.hsetAsync(config.TOKENS_KEY, email, refreshToken);
    } catch (err) {
      console.error(err);
    }
  }

  async getRefreshTokens() {
    try {
      const refreshTokens = await this.client.hgetallAsync(config.TOKENS_KEY);
      return refreshTokens;
    } catch (err) {
      console.error(err);
    }
  }

  async deleteRefreshToken(email) {
    try {
      await this.client.hdelAsync(config.TOKENS_KEY, email);
    } catch (err) {
      console.error(err);
    }
  }
}

module.exports = new Redis();
