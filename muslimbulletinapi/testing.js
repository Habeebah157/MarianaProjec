// <<<<<<< HEAD
// const { Client } = require('pg');
// require('dotenv').config();

// async function testConnection() {
//   const client = new Client({
//     connectionString: process.env.DATABASE_URL,
//   });
//   await client.connect();
//   const res = await client.query('SELECT version()');
//   console.log(res.rows[0]);
//   await client.end();
// }

// testConnection().catch(console.error);
// =======
const { HfInference } = require('@huggingface/inference');
const hf = new HfInference('your-api-key');

async function test() {
  try {
    const result = await hf.textGeneration({
      model: 'gpt2',
      inputs: 'Hello world'
    });
    console.log(result);
  } catch (error) {
    console.error('Test failed:', error);
  }
}

test();
// >>>>>>> 1847ce0f0f953a0ed0c69afa2607acfbff3d5a05
