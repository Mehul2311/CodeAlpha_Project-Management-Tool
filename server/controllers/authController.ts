import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { db } from '../db.js';
import { JWT_SECRET, AuthRequest } from '../middleware/auth.js';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  role: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

function createToken(userId: string, rememberMe = true) {
  const expiresIn = rememberMe ? '30d' : '1d';
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn });
}

function setTokenCookie(res: Response, token: string, rememberMe = true) {
  const maxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
  res.cookie('kaam_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge,
  });
}

export async function signup(req: Request, res: Response) {
  try {
    const validated = signupSchema.parse(req.body);
    const existing = await db.users.findOne((u) => u.email.toLowerCase() === validated.email.toLowerCase());

    if (existing) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(validated.password, salt);

    const colors = ['bg-amber-600', 'bg-emerald-600', 'bg-blue-600', 'bg-indigo-600', 'bg-rose-600', 'bg-teal-600'];
    const avatarColor = colors[Math.floor(Math.random() * colors.length)];

    const user = await db.users.create({
      name: validated.name,
      email: validated.email.toLowerCase(),
      passwordHash,
      avatarColor,
      phone: validated.phone || '+91 ',
      role: validated.role || 'Team Member',
    });

    const token = createToken(user.id, true);
    setTokenCookie(res, token, true);

    const { passwordHash: _, ...userSafe } = user;
    return res.status(201).json({ user: userSafe, token });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: err.issues[0]?.message || 'Validation error' });
    }
    return res.status(500).json({ message: err.message || 'Error creating account.' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const validated = loginSchema.parse(req.body);
    const user = await db.users.findOne((u) => u.email.toLowerCase() === validated.email.toLowerCase());

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isValid = bcrypt.compareSync(validated.password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = createToken(user.id, validated.rememberMe ?? true);
    setTokenCookie(res, token, validated.rememberMe ?? true);

    const { passwordHash: _, ...userSafe } = user;
    return res.json({ user: userSafe, token });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: err.issues[0]?.message || 'Validation error' });
    }
    return res.status(500).json({ message: err.message || 'Error logging in.' });
  }
}

export async function demoLogin(req: Request, res: Response) {
  try {
    const { email } = req.body;
    const user = await db.users.findOne((u) => u.email.toLowerCase() === email?.toLowerCase());

    if (!user) {
      return res.status(404).json({ message: 'Demo user not found.' });
    }

    const token = createToken(user.id, true);
    setTokenCookie(res, token, true);

    const { passwordHash: _, ...userSafe } = user;
    return res.json({ user: userSafe, token });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Error processing demo login.' });
  }
}

export async function me(req: AuthRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }
  const { passwordHash: _, ...userSafe } = req.user;
  return res.json({ user: userSafe });
}

export async function logout(req: Request, res: Response) {
  res.clearCookie('kaam_token');
  return res.json({ message: 'Logged out successfully.' });
}

export async function updateProfile(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated.' });

    const { name, phone, role, currentPassword, newPassword } = req.body;

    const updateData: Partial<typeof req.user> = {};
    if (name) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (role !== undefined) updateData.role = role;

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required to change password.' });
      }
      const isValid = bcrypt.compareSync(currentPassword, req.user.passwordHash);
      if (!isValid) {
        return res.status(400).json({ message: 'Current password does not match.' });
      }
      updateData.passwordHash = bcrypt.hashSync(newPassword, bcrypt.genSaltSync(10));
    }

    const updated = await db.users.findByIdAndUpdate(req.user.id, updateData);
    if (!updated) return res.status(404).json({ message: 'User not found.' });

    const { passwordHash: _, ...userSafe } = updated;
    return res.json({ user: userSafe });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Error updating profile.' });
  }
}

export async function getAllUsers(req: AuthRequest, res: Response) {
  try {
    const users = await db.users.find();
    const safeUsers = users.map(({ passwordHash: _, ...u }) => u);
    return res.json({ users: safeUsers });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Error loading users.' });
  }
}
