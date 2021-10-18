require("dotenv").config();

const CONFIG = {
  PORT: process.env.PORT || 3000,
  CHAT_NAMESPACE: "/chat",
  REDIS_HOST: process.env.REDIS_HOST || "localhost",
  REDIS_PORT: process.env.REDIS_PORT || 6379,
  CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  CALLBACK_URL: process.env.CALLBACK_URL,
  SESSION_NAME: process.env.SESSION_NAME,
  USERS_KEY: process.env.USERS_KEY,
  TOKENS_KEY: process.env.TOKENS_KEY,
};

module.exports = CONFIG;
