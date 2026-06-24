import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { getUsers, saveUsers, User } from '../config/database';
import { JWT_SECRET, JWT_EXPIRES_IN, BCRYPT_ROUNDS } from '../config/auth';
import { AuthenticatedRequest } from '../middleware/auth';

function generateId(): string {
  return crypto.randomUUID();
}

export async function register(req: Request, res: Response) {
  try {
    const { email, username, password, fullName, phoneNumber, avatarUrl, bio } = req.body;

    const users = getUsers();

    // Check email uniqueness
    const emailExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (emailExists) {
      return res.status(400).json({ error: 'A user with this email already exists.' });
    }

    // Check username uniqueness
    const usernameExists = users.some(u => u.username.toLowerCase() === username.toLowerCase());
    if (usernameExists) {
      return res.status(400).json({ error: 'A user with this username already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
    const passwordHash = await bcrypt.hash(password, salt);

    const now = new Date().toISOString();
    const newUser: User = {
      id: generateId(),
      username,
      email,
      passwordHash,
      fullName,
      phoneNumber: phoneNumber || '',
      avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(username)}`,
      bio: bio || '',
      createdAt: now,
      updatedAt: now
    };

    users.push(newUser);
    saveUsers(users);

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, username: newUser.username, email: newUser.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as any }
    );

    // Exclude passwordHash in output
    const { passwordHash: _, ...userWithoutPassword } = newUser;

    return res.status(201).json({
      message: 'User registered successfully.',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error during registration.' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({ error: 'Username/Email and password are required.' });
    }

    const users = getUsers();
    const user = users.find(
      u => u.email.toLowerCase() === emailOrUsername.toLowerCase() || 
           u.username.toLowerCase() === emailOrUsername.toLowerCase()
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid username/email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username/email or password.' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as any }
    );

    const { passwordHash: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error during login.' });
  }
}

export function logout(req: Request, res: Response) {
  return res.status(200).json({ message: 'Logout successful.' });
}

export function verifyToken(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token session.' });
    }

    const users = getUsers();
    const user = users.find(u => u.id === req.user!.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const { passwordHash: _, ...userWithoutPassword } = user;
    return res.status(200).json({
      valid: true,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Verify error:', error);
    return res.status(500).json({ error: 'Internal server error verifying token.' });
  }
}
