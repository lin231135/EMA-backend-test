import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db/connection.js';

// Helper to build user object without password
const mapUser = (row) => ({
  id: row.id,
  name: row.name,
  last_name: row.last_name,
  email: row.email,
  phone: row.phone,
  role: row.role,
  description: row.description,
  is_active: row.is_active,
});

export const register = async (req, res) => {
  const { name, last_name, email, phone, password } = req.body;

  try {
    const duplicate = await db.query('SELECT id FROM "User" WHERE email = $1', [email]);
    if (duplicate.rowCount > 0) {
      return res.status(409).json({ message: 'El correo ya está registrado' });
    }

    const hashed = await bcrypt.hash(password, 10);

    const result = await db.query(
      `INSERT INTO "User"(name, last_name, email, phone, password, role)
       VALUES ($1, $2, $3, $4, $5, 'padre')
       RETURNING id, name, last_name, email, phone, role, description, is_active`,
      [name, last_name, email, phone, hashed]
    );

    return res.status(201).json({ user: mapUser(result.rows[0]) });
  } catch (error) {
    console.error('register error', error);
    return res.status(500).json({ message: 'Error al registrar usuario' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query(
      `SELECT id, name, last_name, email, password, phone, role, description, is_active
       FROM "User" WHERE email = $1`,
      [email]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(403).json({ message: 'Usuario inactivo' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'jwtsecret',
      { expiresIn: '8h' }
    );

    return res.status(200).json({ token, user: mapUser(user) });
  } catch (error) {
    console.error('login error', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const me = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, name, last_name, email, phone, role, description, is_active
       FROM "User" WHERE id = $1`,
      [req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    return res.status(200).json({ user: mapUser(result.rows[0]) });
  } catch (error) {
    console.error('me error', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};
