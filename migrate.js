import fs from 'fs';
import pkg from 'pg';
const { Client } = pkg;

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres:sridharan2007@db.dgddvullkcpcammguynj.supabase.co:5432/postgres'
  });
  
  try {
    await client.connect();
    console.log('Connected to DB');
    const sql = fs.readFileSync('supabase/migrations/001_initial_schema.sql', 'utf8');
    await client.query(sql);
    console.log('Migration executed successfully');
  } catch (err) {
    console.error('Error executing migration', err);
  } finally {
    await client.end();
  }
}
run();
