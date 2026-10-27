import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/login', async (req, res) => {
  try {
    const { membershipId, password } = req.body;
    if (!membershipId || !password) return res.status(400).json({ message: 'Membership ID and password are required.' });
    const [rows] = await pool.execute(
      'SELECT id, name, membership_id, role, password_hash FROM users WHERE membership_id = ?',
      [membershipId.trim()]
    );
    if (!rows.length || !(await bcrypt.compare(password, rows[0].password_hash))) {
      return res.status(401).json({ message: 'Invalid membership ID or password.' });
    }
    const user = rows[0];
    const token = jwt.sign(
      { id: user.id, name: user.name, membershipId: user.membership_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({ token, user: { id: user.id, name: user.name, membershipId: user.membership_id, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Login failed.' });
  }
});

router.get('/me', authenticate, (req, res) => res.json({ user: req.user }));
export default router;
