// Import the PostgreSQL client
const { Pool } = require('pg');
require('dotenv').config(); // Load environment variables

// Database configuration (use environment variables for security)
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT || 5432,
});

// Test the database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Error connecting to PostgreSQL:', err);
  } else {
    console.log(`✅ PostgreSQL connected at ${res.rows[0].now}`);
  }
});

// Export the pool for use in other files
module.exports = pool;