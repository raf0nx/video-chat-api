const sequelize = require('../config/db.config');

async function test() {
  try {
    await sequelize.authenticate();
    console.log("Authenticated!");
  } catch (err) {
    console.error("Unable to connect to the database", error);
  }
}

test();
