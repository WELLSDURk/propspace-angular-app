import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { getUsers, saveUsers } from '../config/database';
import { AuthenticatedRequest } from '../middleware/auth';
import { BCRYPT_ROUNDS } from '../config/auth';

export function getProfile(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const users = getUsers();
    const user = users.find(u => u.id === req.user!.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const { passwordHash: _, ...userWithoutPassword } = user;
    return res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ error: 'Internal server error fetching profile.' });
  }
}

export function updateProfile(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const { fullName, phoneNumber, avatarUrl, bio } = req.body;

    if (!fullName || fullName.trim().length === 0) {
      return res.status(400).json({ error: 'Full name is required.' });
    }

    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === req.user!.id);

    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const updatedUser = {
      ...users[userIndex],
      fullName,
      phoneNumber: phoneNumber || '',
      avatarUrl: avatarUrl || users[userIndex].avatarUrl,
      bio: bio || '',
      updatedAt: new Date().toISOString()
    };

    users[userIndex] = updatedUser;
    saveUsers(users);

    const { passwordHash: _, ...userWithoutPassword } = updatedUser;
    return res.status(200).json({
      message: 'Profile updated successfully.',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ error: 'Internal server error updating profile.' });
  }
}

export async function changePassword(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long.' });
    }

    const hasNumber = /\d/.test(newPassword);
    const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
    if (!hasNumber || !hasSpecial) {
      return res.status(400).json({ error: 'New password must contain at least one number and one special character.' });
    }

    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === req.user!.id);

    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const user = users[userIndex];

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect current password.' });
    }

    // Hash and save new password
    const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    user.passwordHash = newPasswordHash;
    user.updatedAt = new Date().toISOString();

    users[userIndex] = user;
    saveUsers(users);

    return res.status(200).json({ message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ error: 'Internal server error changing password.' });
  }
}
