import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import pool from './db.js';
dotenv.config();

const rl = readline.createInterface({ input, output });
try {
  const name = (await rl.question('Admin name: ')).trim();
  const membershipId = (await rl.question('Admin membership ID (e.g. ADMIN001): ')).trim();
  const password = await rl.question('Admin password (choose a strong password): ');
  if (!name || !membershipId || password.length < 8) {
    throw new Error('Name and membership ID are required; password must be at least 8 characters.');
  }
  const hash = await bcrypt.hash(password, 10);
  await pool.execute('INSERT INTO users (name, membership_id, role, password_hash) VALUES (?, ?, ?, ?)', [name, membershipId, 'Admin', hash]);
  console.log('Administrator created. Log in using that membership ID and password.');
} catch (error) {
  console.error('Could not create administrator:', error.code === 'ER_DUP_ENTRY' ? 'That membership ID already exists.' : error.message);
  process.exitCode = 1;
} finally {
  rl.close();
  await pool.end();
}
