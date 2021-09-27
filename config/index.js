const CONFIG = {
  PORT: process.env.PORT || 3000,
  CHAT_NAMESPACE: "/chat",
  REDIS_HOST: process.env.REDIS_HOST || "localhost",
  REDIS_PORT: process.env.REDIS_PORT || 6379,
  KEY: "unique",
  CLIENT_ID:
    process.env.CLIENT_ID ||
    "4219937188-t07a2duv5ijjstlfph20cqrh5lcgh3bf.apps.googleusercontent.com",
  CLIENT_SECRET: process.env.CLIENT_SECRET || "_BC6q7xTtWHGKu_2kN2bZH7w",
  CALLBACK_URL:
    process.env.CALLBACK_URL || "http://localhost:3000/auth/google/callback",
  SESSION_NAME: process.env.SESSION_NAME || "vochat-session",
};

module.exports = CONFIG;
