const app = require("./src/app");
const { testDbConnection } = require("./src/config/db");
const { testRedisConnection } = require("./src/config/redis");

require("dotenv").config();

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await testDbConnection();
    await testRedisConnection();

    app.listen(PORT, () => {
      console.log(`Findr server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();
