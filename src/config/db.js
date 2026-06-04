const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    let dbUrl = process.env.MONGO_URI;

    if (process.env.NODE_ENV === 'development') {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      dbUrl = mongod.getUri();
      console.log('Using In-Memory MongoDB');
    }

    const conn = await mongoose.connect(dbUrl);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
