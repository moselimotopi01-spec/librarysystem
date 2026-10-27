import { Router } from 'express';
import pool from '../db.js';
import { authenticate, allowRoles } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(`SELECT t.id, t.book_id AS bookId, b.title AS bookTitle, t.type, t.quantity, t.created_at AS date, u.name AS performedBy FROM transactions t JOIN books b ON b.id=t.book_id LEFT JOIN users u ON u.id=t.user_id ORDER BY t.id DESC`);
    res.json(rows);
  } catch (e) { console.error(e); res.status(500).json({ message: 'Could not load transaction history.' }); }
});

router.post('/', allowRoles('Admin', 'Librarian'), async (req, res) => {
  const { bookId, type, quantity } = req.body;
  const amount = Number(quantity);
  if (!Number.isInteger(Number(bookId)) || !Number.isInteger(amount) || amount < 1 || !['add','borrow'].includes(type)) return res.status(400).json({ message: 'Choose a book, a valid transaction type, and a positive whole quantity.' });
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [books] = await connection.execute('SELECT id, title, quantity FROM books WHERE id=? FOR UPDATE', [bookId]);
    if (!books.length) { await connection.rollback(); return res.status(404).json({ message: 'Book not found.' }); }
    const book = books[0];
    if (type === 'borrow' && amount > book.quantity) { await connection.rollback(); return res.status(400).json({ message: `Only ${book.quantity} copies are available.` }); }
    const change = type === 'add' ? amount : -amount;
    await connection.execute('UPDATE books SET quantity=quantity+? WHERE id=?', [change, bookId]);
    const label = type === 'add' ? 'Stock Added' : 'Borrowed';
    const [result] = await connection.execute('INSERT INTO transactions (book_id, user_id, type, quantity) VALUES (?, ?, ?, ?)', [bookId, req.user.id, label, amount]);
    await connection.commit();
    res.status(201).json({ id: result.insertId, bookId: Number(bookId), bookTitle: book.title, type: label, quantity: amount, remainingQuantity: book.quantity + change });
  } catch (e) {
    await connection.rollback(); console.error(e); res.status(500).json({ message: 'Transaction failed; no stock change was saved.' });
  } finally { connection.release(); }
});
export default router;
