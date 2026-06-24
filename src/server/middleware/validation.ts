import { Request, Response, NextFunction } from 'express';

export function validateRegistration(req: Request, res: Response, next: NextFunction) {
  const { email, username, password, fullName } = req.body;

  if (!email || !username || !password || !fullName) {
    return res.status(400).json({ error: 'All fields (email, username, password, fullName) are required.' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address format.' });
  }

  // Validate username
  if (username.length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 characters long.' });
  }

  // Validate secure password (min 8 characters, at least one number and special character)
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
  }
  
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  if (!hasNumber || !hasSpecial) {
    return res.status(400).json({ error: 'Password must contain at least one number and one special character.' });
  }

  next();
}

export function validateProperty(req: Request, res: Response, next: NextFunction) {
  const { title, description, price, location, propertyType, status } = req.body;

  if (!title || typeof title !== 'string' || title.trim().length === 0 || title.length > 100) {
    return res.status(400).json({ error: 'Title is required and must be maximum 100 characters.' });
  }

  if (!description || typeof description !== 'string' || description.trim().length === 0 || description.length > 2000) {
    return res.status(400).json({ error: 'Description is required and must be maximum 2000 characters.' });
  }

  if (price === undefined || typeof price !== 'number' || price <= 0) {
    return res.status(400).json({ error: 'Price is required and must be a positive number.' });
  }

  if (!location || !location.city || !location.country || !location.city.trim() || !location.country.trim()) {
    return res.status(400).json({ error: 'Location containing city and country is required.' });
  }

  const validTypes = ['Apartment', 'House', 'Studio', 'Villa', 'Commercial'];
  if (!propertyType || !validTypes.includes(propertyType)) {
    return res.status(400).json({ error: `Property type must be one of: ${validTypes.join(', ')}.` });
  }

  const validStatuses = ['For Rent', 'For Sale'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}.` });
  }

  next();
}
