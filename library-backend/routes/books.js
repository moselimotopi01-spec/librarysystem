import { Router } from 'express';
import pool from '../db.js';
import { authenticate, allowRoles } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT id, title, author, genre, isbn, quantity FROM books ORDER BY id DESC');
    res.json(rows);
  } catch (e) { console.error(e); res.status(500).json({ message: 'Could not load books.' }); }
});

router.post('/', allowRoles('Admin', 'Librarian'), async (req, res) => {
  try {
    const { title, author, genre, isbn, quantity } = req.body;
    if (![title, author, genre, isbn].every(v => typeof v === 'string' && v.trim()) || !Number.isInteger(Number(quantity)) || Number(quantity) < 0) {
      return res.status(400).json({ message: 'Enter valid book details and a non-negative whole quantity.' });
    }
    const [result] = await pool.execute('INSERT INTO books (title, author, genre, isbn, quantity) VALUES (?, ?, ?, ?, ?)', [title.trim(), author.trim(), genre.trim(), isbn.trim(), Number(quantity)]);
    const [rows] = await pool.execute('SELECT id, title, author, genre, isbn, quantity FROM books WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'A book with that ISBN already exists.' });
    console.error(e); res.status(500).json({ message: 'Could not add book.' });
  }
});

router.put('/:id', allowRoles('Admin', 'Librarian'), async (req, res) => {
  try {
    const { title, author, genre, isbn, quantity } = req.body;
    if (![title, author, genre, isbn].every(v => typeof v === 'string' && v.trim()) || !Number.isInteger(Number(quantity)) || Number(quantity) < 0) return res.status(400).json({ message: 'Enter valid book details.' });
    const [result] = await pool.execute('UPDATE books SET title=?, author=?, genre=?, isbn=?, quantity=? WHERE id=?', [title.trim(), author.trim(), genre.trim(), isbn.trim(), Number(quantity), req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Book not found.' });
    const [rows] = await pool.execute('SELECT id, title, author, genre, isbn, quantity FROM books WHERE id=?', [req.params.id]);
    res.json(rows[0]);
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'A book with that ISBN already exists.' });
    console.error(e); res.status(500).json({ message: 'Could not update book.' });
  }
});

router.delete('/:id', allowRoles('Admin', 'Librarian'), async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM books WHERE id=?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Book not found.' });
    res.json({ message: 'Book deleted.' });
  } catch (e) {
    if (e.code === 'ER_ROW_IS_REFERENCED_2') return res.status(409).json({ message: 'This book has transaction history and cannot be deleted.' });
    console.error(e); res.status(500).json({ message: 'Could not delete book.' });
  }
});
export default router;
