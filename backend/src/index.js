require('dotenv').config();
const app = require('./app');
const prisma = require('./config/db');

const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Connected to MySQL database successfully');

    // Start Express server
    app.listen(PORT, () => {
      console.log(`🚀 Express JavaScript Server running on http://localhost:${PORT}`);
      console.log(`   API Base URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
