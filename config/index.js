require("dotenv").config();

const CONFIG = {
  PORT: process.env.PORT || 3000,
  CHAT_NAMESPACE: process.env.CHAT_NAMESPACE,
  REDIS_HOST: process.env.REDIS_HOST || "localhost",
  REDIS_PORT: process.env.REDIS_PORT || 6379,
  CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  CALLBACK_URL:
    process.env.CALLBACK_URL || "http://localhost:3000/auth/google/callback",
  SUCCESS_URL: process.env.SUCCESS_URL || "http://localhost:8080/auth/success",
  ERROR_URL: process.env.ERROR_URL || "http://localhost:8080/error",
  SESSION_NAME: process.env.SESSION_NAME,
  USERS_KEY: process.env.USERS_KEY,
  TOKENS_KEY: process.env.TOKENS_KEY,
};

module.exports = CONFIG;
