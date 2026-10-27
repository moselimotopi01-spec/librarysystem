import { Router } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../db.js';
import { authenticate, allowRoles } from '../middleware/auth.js';

const router = Router();
router.use(authenticate, allowRoles('Admin'));

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT id, name, membership_id AS membershipId, role FROM users ORDER BY id DESC');
    res.json(rows);
  } catch (e) { console.error(e); res.status(500).json({ message: 'Could not load users.' }); }
});

router.post('/', async (req, res) => {
  try {
    const { name, membershipId, role, password } = req.body;
    if (![name, membershipId, password].every(v => typeof v === 'string' && v.trim()) || !['Admin','Librarian','Membership'].includes(role)) return res.status(400).json({ message: 'Enter valid user details.' });
    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.execute('INSERT INTO users (name, membership_id, role, password_hash) VALUES (?, ?, ?, ?)', [name.trim(), membershipId.trim(), role, hash]);
    res.status(201).json({ id: result.insertId, name: name.trim(), membershipId: membershipId.trim(), role });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'That membership ID already exists.' });
    console.error(e); res.status(500).json({ message: 'Could not add user.' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, membershipId, role, password } = req.body;
    if (![name, membershipId].every(v => typeof v === 'string' && v.trim()) || !['Admin','Librarian','Membership'].includes(role)) return res.status(400).json({ message: 'Enter valid user details.' });
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      await pool.execute('UPDATE users SET name=?, membership_id=?, role=?, password_hash=? WHERE id=?', [name.trim(), membershipId.trim(), role, hash, req.params.id]);
    } else {
      await pool.execute('UPDATE users SET name=?, membership_id=?, role=? WHERE id=?', [name.trim(), membershipId.trim(), role, req.params.id]);
    }
    const [rows] = await pool.execute('SELECT id, name, membership_id AS membershipId, role FROM users WHERE id=?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'User not found.' });
    res.json(rows[0]);
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'That membership ID already exists.' });
    console.error(e); res.status(500).json({ message: 'Could not update user.' });
  }
});

router.delete('/:id', async (req, res) => {
  if (Number(req.params.id) === req.user.id) return res.status(400).json({ message: 'You cannot delete your own logged-in account.' });
  try {
    const [result] = await pool.execute('DELETE FROM users WHERE id=?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'User not found.' });
    res.json({ message: 'User deleted.' });
  } catch (e) { console.error(e); res.status(500).json({ message: 'Could not delete user.' }); }
});
export default router;
