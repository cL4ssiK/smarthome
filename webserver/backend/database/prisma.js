import pkg from '../generated/prisma/client.js'; 

// In the generated client.js, the class is usually the default export
const PrismaClient = pkg.PrismaClient || pkg;

import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

// Initialize with the adapter
const prisma = new PrismaClient({ adapter });

export default prisma;