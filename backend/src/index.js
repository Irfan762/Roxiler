require('dotenv').config();
const app = require('./app');
const db = require('./config/db');

const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    // Test MySQL database connection with standard SQL
    await db.query('SELECT 1');
    console.log('✅ Connected to MySQL database successfully using standard SQL');

    // Start Express server
    app.listen(PORT, () => {
      console.log(`🚀 Express Standard SQL Server running on http://localhost:${PORT}`);
      console.log(`   API Base URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
