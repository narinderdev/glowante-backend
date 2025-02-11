import pgPromise from 'pg-promise';
import dotenv from 'dotenv';

dotenv.config();

// Ensure only one instance of pg-promise is created
const initOptions = {
  noWarnings: true, // Suppress duplicate connection warnings
};

const pgp = pgPromise(initOptions);

// Check if an existing connection exists
const globalForDB = global;
if (!globalForDB.db) {
  globalForDB.db = pgp(process.env.DATABASE_URL);
}

const db = globalForDB.db;

export default db;