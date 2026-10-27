import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db.js';
import authRoutes from './routes/auth.js';
import bookRoutes from './routes/books.js';
import userRoutes from './routes/users.js';
import transactionRoutes from './routes/transactions.js';

dotenv.config();
const app = express();
app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));
app.use(express.json());

app.get('/', (req, res) => res.json({ message: 'KINGS Library API is running.' }));
app.get('/api/health', async (req, res) => {
  try { await pool.query('SELECT 1'); res.json({ api: 'ok', database: 'connected' }); }
  catch { res.status(500).json({ api: 'ok', database: 'disconnected' }); }
});
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Unexpected server error.' });
});

const port = Number(process.env.PORT) || 5000;
try {
  await pool.query('SELECT 1');
  app.listen(port, () => console.log(`KINGS Library API running at http://localhost:${port}`));
} catch (error) {
  console.error('Could not connect to MySQL. Check your .env settings and ensure MySQL Server is running.');
  console.error(error.message);
  process.exit(1);
}
