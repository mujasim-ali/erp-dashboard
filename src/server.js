const app = require('./app');
const connectDB = require('./config/db');

// Connect to database
connectDB();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`\n🚀 Server is running!`);
  console.log(`📡 Mode: ${process.env.NODE_ENV}`);
  console.log(`🔗 URL:  ${process.env.BASE_URL || `http://localhost:${PORT}`}`);
  console.log(`💾 DB:   In-Memory MongoDB Connected\n`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
