require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });
const fs = require('fs');
const csv = require('csv-parser');
const { Pool } = require('pg');

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('Error: DATABASE_URL must be set in .env');
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
  // Fix for self-signed certificates with Supabase pooling
  ssl: { rejectUnauthorized: false }
});

const BATCH_SIZE = 500;
let contacts = [];
let totalInserted = 0;
let totalFailed = 0;

async function insertBatch(batch) {
  const client = await pool.connect();
  try {
    const values = [];
    const placeholders = [];
    
    let paramIndex = 1;
    for (const contact of batch) {
      values.push(contact.name, contact.phone);
      placeholders.push(`($${paramIndex++}, $${paramIndex++})`);
    }
    
    const query = `INSERT INTO contacts (name, phone) VALUES ${placeholders.join(', ')}`;
    await client.query(query, values);
    
    totalInserted += batch.length;
    console.log(`Successfully inserted batch of ${batch.length} contacts. Total inserted: ${totalInserted}`);
  } catch (err) {
    console.error('Error inserting batch:', err.message || err);
    totalFailed += batch.length;
  } finally {
    client.release();
  }
}

async function processFile() {
  return new Promise((resolve, reject) => {
    fs.createReadStream('contacts-export.csv')
      .pipe(csv())
      .on('data', (row) => {
        // Only extract name and phone
        if (row.name && row.phone) {
          contacts.push({
            name: row.name.trim(),
            phone: row.phone.trim()
          });
        }
      })
      .on('end', async () => {
        console.log(`Finished reading CSV. Found ${contacts.length} valid contacts to insert.`);
        
        for (let i = 0; i < contacts.length; i += BATCH_SIZE) {
          const batch = contacts.slice(i, i + BATCH_SIZE);
          await insertBatch(batch);
        }
        
        resolve();
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

async function main() {
  console.log('Starting import process using pg...');
  try {
    await processFile();
    console.log('--- Import Summary ---');
    console.log(`Total successfully inserted: ${totalInserted}`);
    console.log(`Total failed: ${totalFailed}`);
  } catch (error) {
    console.error('Import failed with error:', error);
  } finally {
    await pool.end();
  }
}

main();
