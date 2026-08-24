import { config } from '@/config';
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: config.database.url,
});

export const db = drizzle({ client: pool });
